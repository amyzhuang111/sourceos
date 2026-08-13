import type { z } from "zod";

export interface StructuredGenerateArgs<T> {
  schema: z.ZodType<T>;
  /** The task instruction. */
  prompt: string;
  /** Stable system-level instructions (persona, rules). */
  system?: string;
  /**
   * Untrusted external content (scraped pages, API responses). Always
   * rendered inside explicit delimiters and never treated as instructions —
   * see buildUserContent in anthropic.ts.
   */
  context?: string;
  maxTokens?: number;
}

export interface StructuredGenerateResult<T> {
  data: T;
  model: string;
  inputTokens: number;
  outputTokens: number;
}

export interface LLMProvider {
  readonly configured: boolean;
  structuredGenerate<T>(
    args: StructuredGenerateArgs<T>
  ): Promise<StructuredGenerateResult<T>>;
  summarize(text: string, maxWords?: number): Promise<string>;
}

export class LLMNotConfiguredError extends Error {
  constructor() {
    super(
      "LLMProvider is not configured — set ANTHROPIC_API_KEY in .env.local to enable research, scoring, and other AI-backed features."
    );
    this.name = "LLMNotConfiguredError";
  }
}
