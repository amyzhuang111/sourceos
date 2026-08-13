/**
 * Seed content for the initial Thesis row. Human-editable via /thesis after
 * seeding — these are starting defaults, not permanent truth (CLAUDE.md).
 */
export const DEFAULT_THESIS = {
  name: "Default Thesis",
  description:
    "Seed through Series B, AI-native companies with a real workflow wedge and credible distribution.",
  sectors: [
    "AI infrastructure",
    "agents / agent infrastructure",
    "enterprise AI",
    "data infrastructure",
    "human-data / evaluation systems",
    "voice / multimodal AI",
    "vertical AI with strong workflow ownership",
  ],
  preferredStages: ["PRE_SEED", "SEED", "SERIES_A", "SERIES_B"],
  positiveSignals: [
    "clear wedge into a painful workflow",
    "unusually strong founder-market fit",
    "technical depth that matters to the product",
    "fast product iteration",
    "evidence of real usage",
    "expanding workflow ownership",
    "strong bottoms-up or enterprise pull",
    "new capability unlocked by recent model progress",
  ],
  negativeSignals: [
    "thin wrapper with no workflow ownership",
    "vague target customer",
    "undifferentiated horizontal copilot",
    "traction claims without evidence",
    "service business presented as software without path to leverage",
    "crowded category with no clear wedge",
  ],
  hardExclusions: [] as string[],
  weights: {
    thesisFit: 0.16,
    founderQuality: 0.14,
    technicalDepth: 0.12,
    marketPotential: 0.12,
    timing: 0.1,
    traction: 0.12,
    differentiation: 0.12,
    distributionPotential: 0.08,
    personalInterest: 0.04,
  },
};
