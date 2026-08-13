import { z } from "zod";
import { EvidenceItemSchema } from "./evidence";

/**
 * Structured output for the company-analyst agent. Every narrative field
 * should be evidence-backed prose; `evidence[]` is the citation list that
 * backs the material claims made across the other fields. Unknowns must
 * stay null, never be guessed.
 */
export const ResearchSnapshotSchema = z.object({
  summary: z.string().min(1).max(600),
  problem: z.string().nullable(),
  product: z.string().nullable(),
  whyNow: z.string().nullable(),
  market: z.string().nullable(),
  traction: z.string().nullable(),
  founders: z.string().nullable(),
  competition: z.string().nullable(),
  technicalDepth: z.string().nullable(),
  distribution: z.string().nullable(),
  risks: z.string().nullable(),
  openQuestions: z.array(z.string()).default([]),
  evidence: z.array(EvidenceItemSchema).default([]),
});
export type ResearchSnapshotOutput = z.infer<typeof ResearchSnapshotSchema>;

/**
 * Structured output for the people-researcher agent, for a single person.
 */
export const PersonResearchSchema = z.object({
  name: z.string().min(1),
  role: z.string().nullable(),
  linkedinUrl: z.url().nullable(),
  xUrl: z.url().nullable(),
  personalUrl: z.url().nullable(),
  priorCompanies: z.array(z.string()).default([]),
  education: z.array(z.string()).default([]),
  location: z.string().nullable(),
  notes: z.string().nullable(),
});
export type PersonResearchOutput = z.infer<typeof PersonResearchSchema>;
