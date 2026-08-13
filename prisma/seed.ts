/**
 * Development-only seed. Creates the default Thesis (required for scoring
 * to work at all) and a small, clearly-fictional demo dataset covering the
 * range of statuses/evidence states called for in CLAUDE.md § Seed/demo
 * data. This seed must never be confused with sourced real-world
 * intelligence — every company name below is invented.
 */
import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local", override: true });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { DEFAULT_THESIS } from "../config/default-thesis";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

async function ensureThesis() {
  const existing = await db.thesis.findFirst({ where: { active: true } });
  if (existing) {
    console.log(`Thesis already exists (v${existing.version}) — skipping.`);
    return;
  }
  await db.thesis.create({
    data: {
      name: DEFAULT_THESIS.name,
      description: DEFAULT_THESIS.description,
      sectors: DEFAULT_THESIS.sectors,
      preferredStages: DEFAULT_THESIS.preferredStages,
      positiveSignals: DEFAULT_THESIS.positiveSignals,
      negativeSignals: DEFAULT_THESIS.negativeSignals,
      hardExclusions: DEFAULT_THESIS.hardExclusions,
      weights: DEFAULT_THESIS.weights,
      version: 1,
      active: true,
    },
  });
  console.log("Created default Thesis (v1).");
}

interface DemoCompany {
  name: string;
  domain: string;
  description: string;
  sectors: string[];
  stage: "PRE_SEED" | "SEED" | "SERIES_A" | "SERIES_B";
  status: "NEW" | "RESEARCHING" | "HIGH" | "TRACKING" | "PASS";
  weightedScore: number;
  confidence: number;
  priority: number;
  daysAgo: number;
}

// All names/domains below are invented for demo purposes only.
const DEMO_COMPANIES: DemoCompany[] = [
  {
    name: "Fictive Labs",
    domain: "fictivelabs.example",
    description: "Demo seed: agent evaluation harness for enterprise support teams.",
    sectors: ["agents / agent infrastructure", "human-data / evaluation systems"],
    stage: "SEED",
    status: "NEW",
    weightedScore: 0,
    confidence: 0,
    priority: 0,
    daysAgo: 0,
  },
  {
    name: "Northwind Compute",
    domain: "northwindcompute.example",
    description: "Demo seed: GPU scheduling layer for small AI labs.",
    sectors: ["AI infrastructure"],
    stage: "SERIES_A",
    status: "HIGH",
    weightedScore: 8.1,
    confidence: 0.78,
    priority: 6.3,
    daysAgo: 2,
  },
  {
    name: "Glasspath Analytics",
    domain: "glasspathanalytics.example",
    description: "Demo seed: vertical AI for clinical trial patient matching.",
    sectors: ["vertical AI with strong workflow ownership"],
    stage: "SEED",
    status: "RESEARCHING",
    weightedScore: 6.4,
    confidence: 0.55,
    priority: 3.5,
    daysAgo: 5,
  },
  {
    name: "Cobalt Signal",
    domain: "cobaltsignal.example",
    description: "Demo seed: horizontal copilot with unclear workflow ownership — conflicting evidence on retention.",
    sectors: ["enterprise AI"],
    stage: "SEED",
    status: "RESEARCHING",
    weightedScore: 4.2,
    confidence: 0.4,
    priority: 1.7,
    daysAgo: 9,
  },
  {
    name: "Rivergate Voice",
    domain: "rivergatevoice.example",
    description: "Demo seed: multimodal voice agent for field service dispatch.",
    sectors: ["voice / multimodal AI", "vertical AI with strong workflow ownership"],
    stage: "PRE_SEED",
    status: "TRACKING",
    weightedScore: 7.0,
    confidence: 0.6,
    priority: 4.1,
    daysAgo: 14,
  },
  {
    name: "Palefire Data",
    domain: "palefiredata.example",
    description: "Demo seed: undifferentiated data-labeling wrapper, passed after review.",
    sectors: ["human-data / evaluation systems"],
    stage: "SEED",
    status: "PASS",
    weightedScore: 3.1,
    confidence: 0.7,
    priority: 0.6,
    daysAgo: 21,
  },
];

async function ensureDemoCompanies() {
  for (const demo of DEMO_COMPANIES) {
    const existing = await db.company.findUnique({ where: { canonicalDomain: demo.domain } });
    if (existing) continue;

    const firstSeenAt = new Date(Date.now() - demo.daysAgo * 24 * 60 * 60 * 1000);

    const company = await db.company.create({
      data: {
        name: demo.name,
        canonicalDomain: demo.domain,
        website: `https://${demo.domain}`,
        description: demo.description,
        sectors: demo.sectors,
        stage: demo.stage,
        status: demo.status,
        priority: demo.status === "NEW" ? null : demo.priority,
        firstSeenAt,
        firstSeenSource: "demo_seed",
        firstSeenStrategy: "seed_script",
        discoveredBy: ["demo_seed"],
        sourcingStatus: demo.status === "NEW" ? "DISCOVERED" : "USER_REVIEW",
        lastResearchedAt: demo.status === "NEW" ? null : firstSeenAt,
      },
    });

    await db.mention.create({
      data: {
        companyId: company.id,
        type: "candidate_added",
        body: `Demo seed company created for local testing.`,
        evidenceType: "FACT",
        observedAt: firstSeenAt,
        author: "seed",
      },
    });

    if (demo.status !== "NEW") {
      const snapshot = await db.researchSnapshot.create({
        data: {
          companyId: company.id,
          summary: demo.description,
          problem: "Demo seed data — not a real research finding.",
          product: null,
          whyNow: null,
          market: null,
          traction: demo.status === "HIGH" ? "Demo seed: early signs of usage growth." : null,
          founders: null,
          competition: null,
          technicalDepth: null,
          distribution: null,
          risks:
            demo.name === "Cobalt Signal"
              ? "Demo seed: evidence conflicts on retention — one source claims strong usage, another claims high churn."
              : null,
          openQuestions: demo.name === "Cobalt Signal" ? ["Retention conflict unresolved"] : [],
          evidence: [],
          model: "demo-seed",
          version: 1,
          generatedAt: firstSeenAt,
        },
      });

      await db.mention.create({
        data: {
          companyId: company.id,
          type: "research_completed",
          body: `Demo seed research snapshot v1 created.`,
          evidenceType: "AGENT_ANALYSIS",
          observedAt: firstSeenAt,
          author: "seed",
        },
      });

      const equalDim = demo.weightedScore;
      await db.score.create({
        data: {
          companyId: company.id,
          researchSnapshotId: snapshot.id,
          thesisFit: equalDim,
          founderQuality: equalDim,
          technicalDepth: equalDim,
          marketPotential: equalDim,
          timing: equalDim,
          traction: equalDim,
          differentiation: equalDim,
          distributionPotential: equalDim,
          personalInterest: equalDim,
          weightedScore: demo.weightedScore,
          confidence: demo.confidence,
          reasoning: JSON.stringify({
            topPositives: ["Demo seed data"],
            topConcerns: ["Demo seed data"],
            contrarianCase: "This is seed data for local UI testing, not a real evaluation.",
          }),
          scoringVersion: 1,
          createdAt: firstSeenAt,
        },
      });

      if (demo.status === "PASS") {
        await db.decision.create({
          data: {
            companyId: company.id,
            decision: "PASS",
            reason: "Demo seed: undifferentiated, no clear wedge.",
            decidedAt: firstSeenAt,
          },
        });
      }
      if (demo.status === "HIGH") {
        await db.decision.create({
          data: {
            companyId: company.id,
            decision: "HIGH",
            reason: "Demo seed: strong fit against thesis.",
            decidedAt: firstSeenAt,
          },
        });
        await db.mention.create({
          data: {
            companyId: company.id,
            type: "user_decision",
            body: "Marked HIGH: Demo seed: strong fit against thesis.",
            evidenceType: "USER_DECISION",
            observedAt: firstSeenAt,
            author: "user",
          },
        });
      }
      if (demo.status === "TRACKING") {
        await db.decision.create({
          data: {
            companyId: company.id,
            decision: "TRACK",
            reason: "Demo seed: promising but too early to act.",
            decidedAt: firstSeenAt,
          },
        });
      }
    }
  }
}

async function main() {
  await ensureThesis();
  await ensureDemoCompanies();
  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
