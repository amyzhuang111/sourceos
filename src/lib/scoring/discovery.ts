/**
 * DiscoveryScore decides ignore / queue / lightweight enrich / deep research
 * — never a substitute for the investment Score. CLAUDE.md: "Do not use the
 * investment score to decide whether a candidate deserves research."
 */
export interface DiscoveryScoreComponents {
  sourceQuality: number; // 0-1
  sourceSelectivity: number; // 0-1
  recency: number; // 0-1
  novelty: number; // 0-1
  multiSourceSupport: number; // 0-1
  founderSignal: number; // 0-1
  technicalSignal: number; // 0-1
  tractionSignal: number; // 0-1
  thesisKeywordFit: number; // 0-1
}

export const DISCOVERY_WEIGHTS: Record<keyof DiscoveryScoreComponents, number> = {
  sourceQuality: 0.2,
  sourceSelectivity: 0.1,
  recency: 0.1,
  novelty: 0.15,
  multiSourceSupport: 0.1,
  founderSignal: 0.1,
  technicalSignal: 0.1,
  tractionSignal: 0.05,
  thesisKeywordFit: 0.1,
};

export type DiscoveryAction = "ignore" | "queue" | "lightweight_enrich" | "deep_research";

export function computeDiscoveryScore(components: DiscoveryScoreComponents): number {
  const keys = Object.keys(DISCOVERY_WEIGHTS) as (keyof DiscoveryScoreComponents)[];
  const sum = keys.reduce((acc, key) => acc + components[key] * DISCOVERY_WEIGHTS[key], 0);
  return Math.round(sum * 1000) / 1000;
}

export function discoveryScoreToAction(score: number): DiscoveryAction {
  if (score >= 0.7) return "deep_research";
  if (score >= 0.45) return "lightweight_enrich";
  if (score >= 0.2) return "queue";
  return "ignore";
}
