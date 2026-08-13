import { db } from "@/lib/db/client";
import { createMention } from "@/lib/mentions/create";
import type { DecisionType, CompanyStatus } from "@/generated/prisma/client";

const DECISION_TO_STATUS: Record<DecisionType, CompanyStatus> = {
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
  PASS: "PASS",
  CONTACT: "CONTACTED",
  MEET: "MEETING",
  TRACK: "TRACKING",
};

/**
 * Records a user decision. This is the taste-learning input: every decision
 * becomes a Decision row + a USER_DECISION mention, and future prioritization
 * only changes through explicit configuration (CLAUDE.md — never silently
 * overfit to one decision).
 */
export async function recordDecision(
  companyId: string,
  decision: DecisionType,
  reason?: string
) {
  const [decisionRow] = await db.$transaction([
    db.decision.create({
      data: { companyId, decision, reason },
    }),
    db.company.update({
      where: { id: companyId },
      data: { status: DECISION_TO_STATUS[decision] },
    }),
  ]);

  await createMention({
    companyId,
    type: "user_decision",
    body: reason ? `Marked ${decision}: ${reason}` : `Marked ${decision}`,
    evidenceType: "USER_DECISION",
    author: "user",
  });

  return decisionRow;
}
