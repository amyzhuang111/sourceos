import { z } from "zod";

const dim = z.number().min(0).max(10);

/**
 * Structured output for the thesis-matcher agent. This is the LLM's
 * dimension-level judgment; the weighted aggregate is always computed by
 * deterministic code in lib/scoring, never asserted by the model.
 */
export const ScoreDimensionsSchema = z.object({
  thesisFit: dim,
  founderQuality: dim,
  technicalDepth: dim,
  marketPotential: dim,
  timing: dim,
  traction: dim,
  differentiation: dim,
  distributionPotential: dim,
  personalInterest: dim,
  confidence: z.number().min(0).max(1),
  topPositives: z.array(z.string()).length(3),
  topConcerns: z.array(z.string()).length(3),
  uncertainClaims: z.array(z.string()).default([]),
  contrarianCase: z.string().min(1),
  reasoning: z.string().min(1),
});
export type ScoreDimensionsOutput = z.infer<typeof ScoreDimensionsSchema>;
