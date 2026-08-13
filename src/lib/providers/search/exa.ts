import type { SearchProvider, SearchResult } from "./types";

interface ExaResultItem {
  title: string | null;
  url: string;
  text?: string;
  publishedDate?: string;
}

interface ExaResponse {
  results: ExaResultItem[];
}

/**
 * Optional adapter for the Exa search API (https://exa.ai). Requires
 * EXA_API_KEY. Entirely optional — the app boots and the manual "add
 * company by URL" flow works without it (see ManualSearchProvider).
 */
export class ExaSearchProvider implements SearchProvider {
  readonly name = "exa";
  private apiKey: string | undefined;

  constructor(apiKey = process.env.EXA_API_KEY) {
    this.apiKey = apiKey;
  }

  get configured(): boolean {
    return !!this.apiKey;
  }

  async webSearch(query: string, opts?: { numResults?: number }): Promise<SearchResult[]> {
    if (!this.apiKey) {
      throw new Error("ExaSearchProvider is not configured — set EXA_API_KEY.");
    }
    const res = await fetch("https://api.exa.ai/search", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.apiKey,
      },
      body: JSON.stringify({
        query,
        numResults: opts?.numResults ?? 10,
        contents: { text: { maxCharacters: 500 } },
      }),
    });
    if (!res.ok) {
      throw new Error(`Exa search failed: ${res.status} ${await res.text()}`);
    }
    const data = (await res.json()) as ExaResponse;
    return data.results.map((r) => ({
      title: r.title ?? r.url,
      url: r.url,
      snippet: r.text,
      publishedDate: r.publishedDate,
    }));
  }
}
