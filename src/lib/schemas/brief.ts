import { z } from "zod";

const briefCompanyRef = z.object({
  companyId: z.string(),
  name: z.string(),
  oneLiner: z.string(),
});

/**
 * Structured output for the /brief skill's daily investor briefing.
 */
export const DailyBriefSchema = z.object({
  generatedAt: z.date().optional(),
  topNewCompanies: z.array(briefCompanyRef).max(5),
  topImportantChanges: z.array(
    briefCompanyRef.extend({ change: z.string() })
  ).max(5),
  materialScoreChanges: z.array(
    briefCompanyRef.extend({ from: z.number(), to: z.number() })
  ),
  needsDecision: z.array(briefCompanyRef),
  suggestedNextActions: z.array(z.string()),
});
export type DailyBriefOutput = z.infer<typeof DailyBriefSchema>;
