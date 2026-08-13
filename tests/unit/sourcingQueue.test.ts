import { describe, expect, it } from "vitest";
import { canTransitionSourcingStatus } from "@/lib/jobs/sourcingQueue";

describe("canTransitionSourcingStatus", () => {
  it("allows the next happy-path step", () => {
    expect(canTransitionSourcingStatus("DISCOVERED", "IDENTITY_RESOLVED")).toBe(true);
    expect(canTransitionSourcingStatus("RESEARCHED", "INVESTMENT_SCORED")).toBe(true);
  });

  it("rejects skipping a step", () => {
    expect(canTransitionSourcingStatus("DISCOVERED", "DEDUPED")).toBe(false);
  });

  it("rejects moving backward", () => {
    expect(canTransitionSourcingStatus("DEDUPED", "DISCOVERED")).toBe(false);
  });

  it("allows any active state to move into a failure state", () => {
    expect(canTransitionSourcingStatus("DISCOVERED", "SOURCE_BLOCKED")).toBe(true);
    expect(canTransitionSourcingStatus("LIGHT_ENRICHED", "INSUFFICIENT_EVIDENCE")).toBe(true);
  });

  it("failure states are terminal", () => {
    expect(canTransitionSourcingStatus("DUPLICATE", "DISCOVERED")).toBe(false);
    expect(canTransitionSourcingStatus("SOURCE_BLOCKED", "IDENTITY_RESOLVED")).toBe(false);
  });

  it("USER_REVIEW is terminal on the happy path", () => {
    expect(canTransitionSourcingStatus("USER_REVIEW", "DISCOVERED")).toBe(false);
  });
});
