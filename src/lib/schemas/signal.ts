import { z } from "zod";

export const SignalTypeEnum = z.enum([
  "FUNDING",
  "LAUNCH",
  "CUSTOMER",
  "HIRING",
  "TRAFFIC",
  "FOUNDER",
  "INVESTOR",
  "PRODUCT",
  "PARTNERSHIP",
  "PRICING",
  "TECHNICAL",
  "OTHER",
]);

export const SignalSchema = z.object({
  type: SignalTypeEnum,
  title: z.string().min(1).max(200),
  value: z.string().nullable().optional(),
  observedAt: z.iso.datetime().or(z.string().min(1)),
  sourceUrl: z.url().nullable().optional(),
  sourceName: z.string().nullable().optional(),
  confidence: z.number().min(0).max(1).nullable().optional(),
  rawMetadata: z.record(z.string(), z.unknown()).nullable().optional(),
});
export type SignalInput = z.infer<typeof SignalSchema>;
