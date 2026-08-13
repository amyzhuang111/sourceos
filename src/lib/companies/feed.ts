import { db } from "@/lib/db/client";

export async function getPriorityFeed() {
  return db.company.findMany({
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    include: {
      scores: { orderBy: { createdAt: "desc" }, take: 1 },
      mentions: { orderBy: { observedAt: "desc" }, take: 1 },
      decisions: { orderBy: { decidedAt: "desc" }, take: 1 },
    },
  });
}

export interface ScoreReasoning {
  topPositives?: string[];
  topConcerns?: string[];
  uncertainClaims?: string[];
  contrarianCase?: string;
  reasoning?: string;
}

export function parseScoreReasoning(reasoning: string | null): ScoreReasoning {
  if (!reasoning) return {};
  try {
    return JSON.parse(reasoning) as ScoreReasoning;
  } catch {
    return {};
  }
}
