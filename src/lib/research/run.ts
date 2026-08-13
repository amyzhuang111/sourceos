import { db } from "@/lib/db/client";
import { getLLMProvider } from "@/lib/providers/llm";
import { withAgentRun } from "@/lib/jobs/agentRun";
import { createMentionsFromEvidence, createMention } from "@/lib/mentions/create";
import { fetchWebsiteText } from "./fetchWebsite";
import { ResearchSnapshotSchema } from "@/lib/schemas/research";
import { ScoreDimensionsSchema } from "@/lib/schemas/score";
import {
  computeWeightedScore,
  computeFreshnessFactor,
  computeNoveltyFactor,
  computePriority,
} from "@/lib/scoring/priority";
import type { ResearchSnapshot, Score } from "@/generated/prisma/client";

const COMPANY_ANALYST_SYSTEM = `You are a company-analyst agent for a startup sourcing system used by a single venture investor.

Build an evidence-backed research snapshot answering: what does the company actually do, who is the customer, what painful problem is solved, why now, what evidence of demand exists, who are the founders, how is this different from alternatives, what might be technically difficult or defensible, what assumptions must be true for this to become large, what could kill the thesis, and what remains unknown.

Rules:
- Separate sourced fact from your own inference. Every entry in "evidence" must be tagged FACT (directly stated in the provided content) or INFERENCE (your reasoning from it).
- Never fabricate traction, funding, customers, founders, dates, or metrics. If something is not present in the provided content, say it is unknown rather than guessing.
- Prefer the company's own words for "problem" and "product"; be skeptical of marketing superlatives with no substance behind them.
- Keep "summary" to 2-3 sentences.`;

const THESIS_MATCHER_SYSTEM = `You are a thesis-matcher agent for a startup sourcing system used by a single venture investor.

Compare a researched company against the investor's active thesis and score it.

Rules:
- Score each of the 9 dimensions independently on a 0-10 scale, grounded in the research snapshot provided — do not just restate the thesis back as a high score everywhere.
- Explain exactly the 3 strongest positive reasons and 3 strongest concerns.
- Identify which claims in the snapshot are uncertain or unverified.
- Include one short, genuine contrarian case against investing.
- Never inflate scores to make the company sound more exciting than the evidence supports.`;

export interface RunResearchResult {
  snapshot: ResearchSnapshot;
  score: Score;
}

/**
 * Phase 2 core loop: fetch primary-source content, run company-analyst to
 * produce an evidence-backed ResearchSnapshot, run thesis-matcher to score
 * it against the active Thesis, and update the company's derived priority.
 * Every step is wrapped in an AgentRun for auditability.
 */
export async function runResearch(companyId: string): Promise<RunResearchResult> {
  const company = await db.company.findUniqueOrThrow({ where: { id: companyId } });
  const llm = getLLMProvider();
  const wasFirstResearch = company.lastResearchedAt == null;

  const snapshot = await withAgentRun(
    "company-analyst",
    `Research ${company.name}`,
    { companyId, website: company.website },
    async (runId) => {
      const page = company.website ? await fetchWebsiteText(company.website) : null;

      const prior = await db.researchSnapshot.findFirst({
        where: { companyId },
        orderBy: { version: "desc" },
      });

      const result = await llm.structuredGenerate({
        schema: ResearchSnapshotSchema,
        system: COMPANY_ANALYST_SYSTEM,
        prompt: [
          `Company: ${company.name}`,
          `Website: ${company.website ?? "unknown"}`,
          company.description ? `Known description: ${company.description}` : null,
          page ? `Homepage content was fetched successfully from ${page.url} at ${page.fetchedAt}.` : "The homepage could not be fetched (blocked, unreachable, or disallowed by robots.txt) — note this as a limitation and rely only on the company name/domain/description above; do not fabricate content.",
        ]
          .filter(Boolean)
          .join("\n"),
        context: page?.text,
        maxTokens: 4000,
      });

      const created = await db.researchSnapshot.create({
        data: {
          companyId,
          summary: result.data.summary,
          problem: result.data.problem,
          product: result.data.product,
          whyNow: result.data.whyNow,
          market: result.data.market,
          traction: result.data.traction,
          founders: result.data.founders,
          competition: result.data.competition,
          technicalDepth: result.data.technicalDepth,
          distribution: result.data.distribution,
          risks: result.data.risks,
          openQuestions: result.data.openQuestions,
          evidence: result.data.evidence,
          model: result.model,
          version: (prior?.version ?? 0) + 1,
        },
      });

      await createMentionsFromEvidence(result.data.evidence, {
        companyId,
        runId,
        author: "company-analyst",
      });

      return {
        result: created,
        outputs: { snapshotId: created.id, summary: result.data.summary },
        model: result.model,
      };
    }
  );

  const thesis = await db.thesis.findFirst({ where: { active: true }, orderBy: { version: "desc" } });
  if (!thesis) {
    throw new Error("No active Thesis found — run the seed script to create the default thesis.");
  }

  const score = await withAgentRun(
    "thesis-matcher",
    `Score ${company.name} against "${thesis.name}"`,
    { companyId, thesisId: thesis.id, snapshotId: snapshot.id },
    async () => {
      const result = await llm.structuredGenerate({
        schema: ScoreDimensionsSchema,
        system: THESIS_MATCHER_SYSTEM,
        prompt: [
          `Active thesis: ${thesis.name}`,
          thesis.description ? `Thesis description: ${thesis.description}` : null,
          `Positive signals: ${JSON.stringify(thesis.positiveSignals)}`,
          `Negative signals: ${JSON.stringify(thesis.negativeSignals)}`,
          `Preferred stages: ${JSON.stringify(thesis.preferredStages)}`,
          `Sectors: ${JSON.stringify(thesis.sectors)}`,
          `Hard exclusions: ${JSON.stringify(thesis.hardExclusions)}`,
          "",
          "Research snapshot to score:",
          `Summary: ${snapshot.summary}`,
          snapshot.problem ? `Problem: ${snapshot.problem}` : null,
          snapshot.product ? `Product: ${snapshot.product}` : null,
          snapshot.whyNow ? `Why now: ${snapshot.whyNow}` : null,
          snapshot.market ? `Market: ${snapshot.market}` : null,
          snapshot.traction ? `Traction: ${snapshot.traction}` : null,
          snapshot.founders ? `Founders: ${snapshot.founders}` : null,
          snapshot.competition ? `Competition: ${snapshot.competition}` : null,
          snapshot.technicalDepth ? `Technical depth: ${snapshot.technicalDepth}` : null,
          snapshot.risks ? `Risks: ${snapshot.risks}` : null,
        ]
          .filter(Boolean)
          .join("\n"),
        maxTokens: 3000,
      });

      const weights = (thesis.weights as Record<string, number>) ?? {};
      const weightedScore = computeWeightedScore(result.data, weights);

      const created = await db.score.create({
        data: {
          companyId,
          researchSnapshotId: snapshot.id,
          thesisFit: result.data.thesisFit,
          founderQuality: result.data.founderQuality,
          technicalDepth: result.data.technicalDepth,
          marketPotential: result.data.marketPotential,
          timing: result.data.timing,
          traction: result.data.traction,
          differentiation: result.data.differentiation,
          distributionPotential: result.data.distributionPotential,
          personalInterest: result.data.personalInterest,
          weightedScore,
          confidence: result.data.confidence,
          reasoning: JSON.stringify({
            topPositives: result.data.topPositives,
            topConcerns: result.data.topConcerns,
            uncertainClaims: result.data.uncertainClaims,
            contrarianCase: result.data.contrarianCase,
            reasoning: result.data.reasoning,
          }),
        },
      });

      return {
        result: created,
        outputs: { scoreId: created.id, weightedScore },
        model: result.model,
      };
    }
  );

  const now = new Date();
  const freshness = computeFreshnessFactor(now, now);
  const novelty = computeNoveltyFactor({
    isFirstSeen: wasFirstResearch,
    hasNewSignalSinceLastRun: true,
    previousStatus: company.status === "MEDIUM" ? "MEDIUM" : "OTHER",
  });
  const priority = computePriority({
    weightedScore: score.weightedScore,
    confidence: score.confidence,
    freshness,
    novelty,
  });

  await db.company.update({
    where: { id: companyId },
    data: {
      status: company.status === "NEW" ? "REVIEW" : company.status,
      sourcingStatus: "INVESTMENT_SCORED",
      lastResearchedAt: now,
      priority,
      description: company.description ?? snapshot.summary,
    },
  });

  await createMention({
    companyId,
    type: "research_completed",
    body: `Research snapshot v${snapshot.version} generated; weighted score ${score.weightedScore}/10, confidence ${score.confidence}.`,
    evidenceType: "AGENT_ANALYSIS",
    author: "thesis-matcher",
  });

  return { snapshot, score };
}
