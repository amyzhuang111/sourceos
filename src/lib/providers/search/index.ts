import { ExaSearchProvider } from "./exa";
import { ManualSearchProvider } from "./manual";
import type { SearchProvider } from "./types";

export type { SearchProvider, SearchResult } from "./types";

let instance: SearchProvider | null = null;

export function getSearchProvider(): SearchProvider {
  if (!instance) {
    const exa = new ExaSearchProvider();
    instance = exa.configured ? exa : new ManualSearchProvider();
  }
  return instance;
}
