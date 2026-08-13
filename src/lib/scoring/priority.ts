export interface ScoreDimensions {
  thesisFit: number;
  founderQuality: number;
  technicalDepth: number;
  marketPotential: number;
  timing: number;
  traction: number;
  differentiation: number;
  distributionPotential: number;
  personalInterest: number;
}

export const SCORE_DIMENSION_KEYS: (keyof ScoreDimensions)[] = [
  "thesisFit",
  "founderQuality",
  "technicalDepth",
  "marketPotential",
  "timing",
  "traction",
  "differentiation",
  "distributionPotential",
  "personalInterest",
];

const DEFAULT_WEIGHT = 1 / SCORE_DIMENSION_KEYS.length;

/**
 * Weighted average of the 0-10 dimension scores. Weights need not sum to 1 —
 * they're normalized here. Missing weights fall back to an equal split.
 * Deterministic aggregation only; dimension-level judgments come from the
 * LLM, never this function (CLAUDE.md: "Use deterministic code for score
 * aggregation. Use LLMs only to produce dimension-level judgments").
 */
export function computeWeightedScore(
  dimensions: ScoreDimensions,
  weights?: Partial<Record<keyof ScoreDimensions, number>>
): number {
  const resolved = SCORE_DIMENSION_KEYS.map((key) => weights?.[key] ?? DEFAULT_WEIGHT);
  const totalWeight = resolved.reduce((a, b) => a + b, 0);
  if (totalWeight <= 0) throw new Error("computeWeightedScore: weights sum to zero");

  const sum = SCORE_DIMENSION_KEYS.reduce(
    (acc, key, i) => acc + dimensions[key] * resolved[i],
    0
  );
  return Math.round((sum / totalWeight) * 100) / 100;
}

/** Exponential decay: full weight at age 0, half weight at halfLifeDays. */
export function computeFreshnessFactor(observedAt: Date, now: Date, halfLifeDays = 30): number {
  const ageDays = Math.max(0, (now.getTime() - observedAt.getTime()) / (1000 * 60 * 60 * 24));
  return Math.pow(0.5, ageDays / halfLifeDays);
}

export interface NoveltyInput {
  isFirstSeen: boolean;
  hasNewSignalSinceLastRun: boolean;
  previousStatus?: "MEDIUM" | "LOW" | "OTHER";
}

/**
 * Boost never-seen companies and MEDIUM companies with a fresh signal;
 * downweight repeatedly-rediscovered companies with nothing new to report.
 */
export function computeNoveltyFactor(input: NoveltyInput): number {
  if (input.isFirstSeen) return 1;
  if (input.hasNewSignalSinceLastRun) {
    return input.previousStatus === "MEDIUM" ? 0.9 : 0.7;
  }
  return 0.3;
}

export interface PriorityInput {
  weightedScore: number; // 0-10
  confidence: number; // 0-1
  freshness: number; // 0-1
  novelty: number; // 0-1
  actionability?: number; // 0-1, defaults to 1
}

/**
 * priority = weighted_score × confidence × freshness × novelty × actionability
 * Transparent by construction — every factor is stored on the Score/Company
 * row so the UI can show why a company moved (CLAUDE.md: "Do not hide the
 * components").
 */
export function computePriority(input: PriorityInput): number {
  const actionability = input.actionability ?? 1;
  const raw =
    input.weightedScore * input.confidence * input.freshness * input.novelty * actionability;
  return Math.round(raw * 100) / 100;
}
