import { z } from "zod";

export const StageEnum = z.enum([
  "PRE_SEED",
  "SEED",
  "SERIES_A",
  "SERIES_B",
  "SERIES_C_PLUS",
  "GROWTH",
  "UNKNOWN",
]);

export const CompanyStatusEnum = z.enum([
  "NEW",
  "RESEARCHING",
  "REVIEW",
  "HIGH",
  "MEDIUM",
  "LOW",
  "PASS",
  "CONTACTED",
  "MEETING",
  "TRACKING",
  "ARCHIVED",
]);

/**
 * What an agent (e.g. Scout) is allowed to propose when it discovers a new
 * company. Deliberately excludes status/priority — those are derived by
 * deterministic scoring code, never asserted directly by an LLM.
 */
export const CandidateCompanySchema = z.object({
  name: z.string().min(1),
  website: z.url(),
  description: z.string().min(1).max(500),
  foundedYear: z.number().int().min(1970).max(2100).nullable().optional(),
  headquarters: z.string().nullable().optional(),
  stage: StageEnum.default("UNKNOWN"),
  sectors: z.array(z.string()).default([]),
  subsectors: z.array(z.string()).default([]),
  businessModel: z.string().nullable().optional(),
  discoverySourceUrl: z.url().nullable().optional(),
  discoveryNote: z.string().max(500),
});
export type CandidateCompany = z.infer<typeof CandidateCompanySchema>;
