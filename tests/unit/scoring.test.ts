import { describe, expect, it } from "vitest";
import {
  computeWeightedScore,
  computeFreshnessFactor,
  computeNoveltyFactor,
  computePriority,
  SCORE_DIMENSION_KEYS,
  type ScoreDimensions,
} from "@/lib/scoring/priority";
import { computeDiscoveryScore, discoveryScoreToAction } from "@/lib/scoring/discovery";

const dims: ScoreDimensions = {
  thesisFit: 8,
  founderQuality: 7,
  technicalDepth: 9,
  marketPotential: 6,
  timing: 8,
  traction: 5,
  differentiation: 7,
  distributionPotential: 6,
  personalInterest: 9,
};

describe("computeWeightedScore", () => {
  it("equal weights produce a plain average", () => {
    const avg =
      SCORE_DIMENSION_KEYS.reduce((acc, k) => acc + dims[k], 0) / SCORE_DIMENSION_KEYS.length;
    expect(computeWeightedScore(dims)).toBeCloseTo(avg, 2);
  });

  it("normalizes weights that don't sum to 1", () => {
    const zeroOthers = Object.fromEntries(
      SCORE_DIMENSION_KEYS.filter((k) => k !== "thesisFit").map((k) => [k, 0])
    );
    // Same relative weighting (only thesisFit counts) at two different
    // absolute scales — normalization should make both collapse to
    // dims.thesisFit exactly.
    const a = computeWeightedScore(dims, { thesisFit: 1, ...zeroOthers });
    const b = computeWeightedScore(dims, { thesisFit: 10, ...zeroOthers });
    expect(a).toBeCloseTo(dims.thesisFit, 2);
    expect(a).toBeCloseTo(b, 5);
  });

  it("throws when all weights are zero", () => {
    const zeroWeights = Object.fromEntries(SCORE_DIMENSION_KEYS.map((k) => [k, 0]));
    expect(() => computeWeightedScore(dims, zeroWeights)).toThrow();
  });
});

describe("computeFreshnessFactor", () => {
  it("is 1 at age zero", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    expect(computeFreshnessFactor(now, now)).toBeCloseTo(1, 5);
  });

  it("halves at the half-life", () => {
    const now = new Date("2026-02-01T00:00:00Z");
    const observed = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    expect(computeFreshnessFactor(observed, now, 30)).toBeCloseTo(0.5, 5);
  });

  it("never goes negative for a future-dated observation", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const future = new Date("2026-06-01T00:00:00Z");
    expect(computeFreshnessFactor(future, now)).toBeLessThanOrEqual(1);
  });
});

describe("computeNoveltyFactor", () => {
  it("boosts a never-seen company to 1", () => {
    expect(
      computeNoveltyFactor({ isFirstSeen: true, hasNewSignalSinceLastRun: false })
    ).toBe(1);
  });

  it("downweights a rediscovered company with no new signal", () => {
    expect(
      computeNoveltyFactor({ isFirstSeen: false, hasNewSignalSinceLastRun: false })
    ).toBeLessThan(0.5);
  });

  it("boosts a MEDIUM company with a fresh signal more than a generic one", () => {
    const medium = computeNoveltyFactor({
      isFirstSeen: false,
      hasNewSignalSinceLastRun: true,
      previousStatus: "MEDIUM",
    });
    const other = computeNoveltyFactor({
      isFirstSeen: false,
      hasNewSignalSinceLastRun: true,
      previousStatus: "OTHER",
    });
    expect(medium).toBeGreaterThan(other);
  });
});

describe("computePriority", () => {
  it("multiplies all factors together", () => {
    expect(
      computePriority({ weightedScore: 8, confidence: 0.5, freshness: 1, novelty: 1 })
    ).toBeCloseTo(4, 5);
  });

  it("defaults actionability to 1", () => {
    const withDefault = computePriority({
      weightedScore: 5,
      confidence: 1,
      freshness: 1,
      novelty: 1,
    });
    const explicit = computePriority({
      weightedScore: 5,
      confidence: 1,
      freshness: 1,
      novelty: 1,
      actionability: 1,
    });
    expect(withDefault).toBe(explicit);
  });

  it("zero confidence zeroes the priority regardless of score", () => {
    expect(
      computePriority({ weightedScore: 10, confidence: 0, freshness: 1, novelty: 1 })
    ).toBe(0);
  });
});

describe("discovery scoring", () => {
  const strong = {
    sourceQuality: 1,
    sourceSelectivity: 1,
    recency: 1,
    novelty: 1,
    multiSourceSupport: 1,
    founderSignal: 1,
    technicalSignal: 1,
    tractionSignal: 1,
    thesisKeywordFit: 1,
  };
  const weak = Object.fromEntries(Object.keys(strong).map((k) => [k, 0])) as typeof strong;

  it("a maxed-out candidate scores 1 and routes to deep research", () => {
    const score = computeDiscoveryScore(strong);
    expect(score).toBeCloseTo(1, 5);
    expect(discoveryScoreToAction(score)).toBe("deep_research");
  });

  it("a zeroed-out candidate scores 0 and is ignored", () => {
    const score = computeDiscoveryScore(weak);
    expect(score).toBe(0);
    expect(discoveryScoreToAction(score)).toBe("ignore");
  });
});
