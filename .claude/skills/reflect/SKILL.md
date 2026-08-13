---
name: reflect
description: Analyze the user's decision history and propose thesis/weight changes as TasteProposal rows. NOT YET IMPLEMENTED — the taste-critic agent definition exists but has no coded pipeline yet.
---

# /reflect

Intended: run the taste-critic agent (`.claude/agents/taste-critic.md`) over
recent `Decision` rows plus the `Score`/`Thesis` each company had at decision
time, and write `TasteProposal` rows for the user to accept/reject on
`/feedback`.

## Current state: not implemented

No coded pipeline. The data this needs already exists and is queryable —
`Decision` (`src/lib/decisions/decide.ts` writes one per decision, joined to
`Company`), `Score` (per-company, versioned via `ResearchSnapshot`), and
`Thesis` (versioned, `src/lib/thesis/thesis.ts`) — but nothing correlates
them into a proposal yet.

## If implementing this

1. Pull `Decision` rows with their company's `Score` at (or nearest before)
   `decidedAt`.
2. Have taste-critic look for patterns per its agent definition.
3. Write results as `TasteProposal` rows (`status: "PENDING"`) — **never**
   call `updateThesis` (`src/lib/thesis/thesis.ts`) directly from this skill.
   That function is reserved for the user's own edit on `/thesis`; an accept
   flow for proposals should be a separate, explicit action the user takes
   on `/feedback`, not something `/reflect` does on its own.
