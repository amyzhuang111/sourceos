import { z } from "zod";

export const EvidenceTypeEnum = z.enum([
  "FACT",
  "INFERENCE",
  "USER_NOTE",
  "USER_DECISION",
  "AGENT_ANALYSIS",
]);

export const MentionSchema = z.object({
  companyId: z.string().nullable().optional(),
  personId: z.string().nullable().optional(),
  runId: z.string().nullable().optional(),
  type: z.string().min(1),
  body: z.string().min(1),
  evidenceType: EvidenceTypeEnum,
  sourceUrl: z.url().nullable().optional(),
  sourceTitle: z.string().nullable().optional(),
  observedAt: z.date().optional(),
  confidence: z.number().min(0).max(1).nullable().optional(),
  author: z.string().min(1),
});
export type MentionInput = z.infer<typeof MentionSchema>;
