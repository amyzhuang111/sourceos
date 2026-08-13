import { db } from "@/lib/db/client";
import type { EvidenceItem } from "@/lib/schemas/evidence";

/**
 * Mentions are append-only (CLAUDE.md: "Never overwrite history merely
 * because a newer mention exists"). This always inserts, never updates.
 */
export async function createMention(input: {
  companyId?: string;
  personId?: string;
  runId?: string;
  type: string;
  body: string;
  evidenceType: "FACT" | "INFERENCE" | "USER_NOTE" | "USER_DECISION" | "AGENT_ANALYSIS";
  sourceUrl?: string | null;
  sourceTitle?: string | null;
  observedAt?: Date;
  confidence?: number | null;
  author: string;
}) {
  return db.mention.create({
    data: {
      companyId: input.companyId,
      personId: input.personId,
      runId: input.runId,
      type: input.type,
      body: input.body,
      evidenceType: input.evidenceType,
      sourceUrl: input.sourceUrl ?? undefined,
      sourceTitle: input.sourceTitle ?? undefined,
      observedAt: input.observedAt ?? new Date(),
      confidence: input.confidence ?? undefined,
      author: input.author,
    },
  });
}

export async function createMentionsFromEvidence(
  evidence: EvidenceItem[],
  base: { companyId: string; runId: string; author: string }
) {
  if (evidence.length === 0) return;
  await db.mention.createMany({
    data: evidence.map((item) => ({
      companyId: base.companyId,
      runId: base.runId,
      type: "research_finding",
      body: item.claim,
      evidenceType: item.evidenceType,
      sourceUrl: item.sourceUrl ?? undefined,
      sourceTitle: item.sourceName ?? undefined,
      observedAt: new Date(),
      author: base.author,
    })),
  });
}
