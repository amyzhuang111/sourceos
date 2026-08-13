import type { SearchProvider, SearchResult } from "./types";

/**
 * No-key fallback. The app must still boot and the manual "add company by
 * URL" flow must still work when no search API key is configured — this
 * provider just reports itself unconfigured so callers can skip discovery
 * features rather than fail.
 */
export class ManualSearchProvider implements SearchProvider {
  readonly configured = false;
  readonly name = "manual";

  async webSearch(): Promise<SearchResult[]> {
    return [];
  }
}
