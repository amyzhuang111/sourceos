import { z } from "zod";

/**
 * Every material factual claim in a research snapshot should retain a URL
 * when available, and be explicitly typed as fact vs. inference.
 */
export const EvidenceItemSchema = z.object({
  claim: z.string().min(1),
  evidenceType: z.enum(["FACT", "INFERENCE"]),
  sourceUrl: z.url().nullable().optional(),
  sourceName: z.string().nullable().optional(),
});
export type EvidenceItem = z.infer<typeof EvidenceItemSchema>;
