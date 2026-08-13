/**
 * Every candidate flows through this queue (CLAUDE.md § Sourcing queue).
 * Failures remain visible — never silently discarded — so they're terminal
 * states reachable from any active step, not just from the end.
 */
export const SOURCING_QUEUE_HAPPY_PATH = [
  "DISCOVERED",
  "IDENTITY_RESOLVED",
  "DEDUPED",
  "LIGHT_ENRICHED",
  "DISCOVERY_SCORED",
  "RESEARCH_QUEUE",
  "RESEARCHED",
  "INVESTMENT_SCORED",
  "USER_REVIEW",
] as const;

export const SOURCING_QUEUE_FAILURE_STATES = [
  "IDENTITY_AMBIGUOUS",
  "SOURCE_BLOCKED",
  "FETCH_FAILED",
  "INSUFFICIENT_EVIDENCE",
  "DUPLICATE",
  "OUT_OF_SCOPE",
] as const;

export type SourcingQueueStatus =
  | (typeof SOURCING_QUEUE_HAPPY_PATH)[number]
  | (typeof SOURCING_QUEUE_FAILURE_STATES)[number];

const FAILURE_SET = new Set<string>(SOURCING_QUEUE_FAILURE_STATES);

/**
 * Valid transitions: one step forward on the happy path, or into any
 * failure state from any non-terminal happy-path step. Failure states are
 * terminal — nothing transitions out of them (a new candidate is created
 * instead of resurrecting a failed one).
 */
export function canTransitionSourcingStatus(
  from: SourcingQueueStatus,
  to: SourcingQueueStatus
): boolean {
  if (FAILURE_SET.has(from)) return false;
  if (FAILURE_SET.has(to)) return true;

  const fromIndex = SOURCING_QUEUE_HAPPY_PATH.indexOf(
    from as (typeof SOURCING_QUEUE_HAPPY_PATH)[number]
  );
  const toIndex = SOURCING_QUEUE_HAPPY_PATH.indexOf(
    to as (typeof SOURCING_QUEUE_HAPPY_PATH)[number]
  );
  if (fromIndex === -1 || toIndex === -1) return false;
  return toIndex === fromIndex + 1;
}
