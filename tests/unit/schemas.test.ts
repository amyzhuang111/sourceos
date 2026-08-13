import { describe, expect, it } from "vitest";
import { CandidateCompanySchema } from "@/lib/schemas/company";
import { EvidenceItemSchema } from "@/lib/schemas/evidence";
import { ScoreDimensionsSchema } from "@/lib/schemas/score";
import { MentionSchema } from "@/lib/schemas/mention";

describe("CandidateCompanySchema", () => {
  it("accepts a well-formed candidate", () => {
    const result = CandidateCompanySchema.safeParse({
      name: "Acme AI",
      website: "https://acme.ai",
      description: "Agent infrastructure for enterprise workflows.",
      stage: "SEED",
      sectors: ["AI infrastructure"],
      discoveryNote: "Found in YC W26 batch.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a non-URL website", () => {
    const result = CandidateCompanySchema.safeParse({
      name: "Acme AI",
      website: "not-a-url",
      description: "desc",
      discoveryNote: "note",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing name", () => {
    const result = CandidateCompanySchema.safeParse({
      website: "https://acme.ai",
      description: "desc",
      discoveryNote: "note",
    });
    expect(result.success).toBe(false);
  });

  it("defaults stage to UNKNOWN and sectors to []", () => {
    const result = CandidateCompanySchema.parse({
      name: "Acme AI",
      website: "https://acme.ai",
      description: "desc",
      discoveryNote: "note",
    });
    expect(result.stage).toBe("UNKNOWN");
    expect(result.sectors).toEqual([]);
  });
});

describe("EvidenceItemSchema — fact vs inference typing", () => {
  it("requires evidenceType to be FACT or INFERENCE, nothing else", () => {
    expect(
      EvidenceItemSchema.safeParse({ claim: "Raised a $5M seed", evidenceType: "FACT" }).success
    ).toBe(true);
    expect(
      EvidenceItemSchema.safeParse({ claim: "Likely growing fast", evidenceType: "INFERENCE" })
        .success
    ).toBe(true);
    expect(
      EvidenceItemSchema.safeParse({ claim: "x", evidenceType: "USER_NOTE" }).success
    ).toBe(false);
  });
});

describe("ScoreDimensionsSchema", () => {
  const base = {
    thesisFit: 8,
    founderQuality: 7,
    technicalDepth: 9,
    marketPotential: 6,
    timing: 8,
    traction: 5,
    differentiation: 7,
    distributionPotential: 6,
    personalInterest: 9,
    confidence: 0.8,
    topPositives: ["a", "b", "c"],
    topConcerns: ["x", "y", "z"],
    contrarianCase: "Could be a thin wrapper.",
    reasoning: "Strong team, crowded market.",
  };

  it("accepts a well-formed score", () => {
    expect(ScoreDimensionsSchema.safeParse(base).success).toBe(true);
  });

  it("rejects a dimension outside 0-10", () => {
    expect(ScoreDimensionsSchema.safeParse({ ...base, thesisFit: 11 }).success).toBe(false);
  });

  it("requires exactly 3 top positives and 3 top concerns", () => {
    expect(
      ScoreDimensionsSchema.safeParse({ ...base, topPositives: ["only one"] }).success
    ).toBe(false);
  });

  it("rejects confidence outside 0-1", () => {
    expect(ScoreDimensionsSchema.safeParse({ ...base, confidence: 1.5 }).success).toBe(false);
  });
});

describe("MentionSchema — evidence type discipline", () => {
  it("accepts USER_DECISION as a valid evidence type for mentions (unlike EvidenceItemSchema)", () => {
    const result = MentionSchema.safeParse({
      type: "decision",
      body: "Marked HIGH",
      evidenceType: "USER_DECISION",
      author: "user",
    });
    expect(result.success).toBe(true);
  });
});
