export interface SearchResult {
  title: string;
  url: string;
  snippet?: string;
  publishedDate?: string;
}

export interface SearchProvider {
  readonly configured: boolean;
  readonly name: string;
  webSearch(query: string, opts?: { numResults?: number }): Promise<SearchResult[]>;
}
