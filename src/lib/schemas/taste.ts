import { z } from "zod";

/**
 * Structured output for the taste-critic agent. This is a *proposal* —
 * lib/jobs code must persist it as a TasteProposal row with status PENDING
 * and must never write it into the active Thesis directly.
 */
export const TasteProposalSchema = z.object({
  proposedChange: z.string().min(1).max(500),
  proposedChangeDetail: z
    .object({
      weightAdjustments: z.record(z.string(), z.number()).optional(),
      addPositiveSignals: z.array(z.string()).optional(),
      addNegativeSignals: z.array(z.string()).optional(),
      addHardExclusions: z.array(z.string()).optional(),
    })
    .nullable()
    .optional(),
  supportingDecisionIds: z.array(z.string()).default([]),
  counterExamples: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1),
});
export type TasteProposalOutput = z.infer<typeof TasteProposalSchema>;

export const TasteReflectionSchema = z.object({
  recurringPositivePatterns: z.array(z.string()).default([]),
  recurringRejectionPatterns: z.array(z.string()).default([]),
  inconsistencies: z.array(z.string()).default([]),
  proposals: z.array(TasteProposalSchema).default([]),
});
export type TasteReflectionOutput = z.infer<typeof TasteReflectionSchema>;
