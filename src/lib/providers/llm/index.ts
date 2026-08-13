import { AnthropicLLMProvider } from "./anthropic";
import type { LLMProvider } from "./types";

export type { LLMProvider, StructuredGenerateArgs, StructuredGenerateResult } from "./types";
export { LLMNotConfiguredError } from "./types";

let instance: LLMProvider | null = null;

/** Default to Anthropic when ANTHROPIC_API_KEY is present, per CLAUDE.md. */
export function getLLMProvider(): LLMProvider {
  if (!instance) instance = new AnthropicLLMProvider();
  return instance;
}
