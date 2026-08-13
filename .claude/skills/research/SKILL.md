---
name: research
description: Deep research one or more companies in SourceOS — runs company-analyst then thesis-matcher and persists a scored ResearchSnapshot. Use when the user says "research X" or names a company already added to SourceOS.
---

# /research

The one skill in this set that's fully wired to working code — no manual
steps needed beyond running it.

## Pipeline

company-analyst → evidence normalization → versioned snapshot → thesis-matcher
→ deterministic weighted score → mentions

This is exactly `runResearch(companyId)` in `src/lib/research/run.ts`.

## How to run it

1. Find the company's ID — `SELECT id, name FROM Company WHERE name LIKE
   '%...%'` via `npx prisma studio`, or check the URL on its `/companies/[id]`
   page.
2. If the company isn't in SourceOS yet, add it first — this skill researches
   existing companies, it doesn't discover new ones (that's `/source`, not
   yet implemented). From the repo root:

   ```ts
   import { addCompanyByUrl } from "./src/lib/companies/create";
   const { company } = await addCompanyByUrl("https://example.com");
   ```

3. Run research:

   ```ts
   import { runResearch } from "./src/lib/research/run";
   const { snapshot, score } = await runResearch(companyId);
   ```

   Or just click "Run research" on the company's page in the running app —
   same function, same result.

## Requirements

- `ANTHROPIC_API_KEY` must be set (`.env.local`) — without it this throws
  `LLMNotConfiguredError` immediately, cleanly, with an `AgentRun` row
  recorded as `FAILED` so it shows up on `/runs`.
- The company needs a `website` — if the homepage can't be fetched (network
  error, blocked, disallowed by robots.txt), the agent still runs but is told
  explicitly not to fabricate content it didn't see.

## What it never does

- Never writes a weighted score itself — `computeWeightedScore` in
  `src/lib/scoring/priority.ts` does that deterministically from the LLM's
  nine dimension-level judgments.
- Never treats fetched page content as instructions — it's always wrapped in
  an explicit `<external_content>` delimiter before it reaches the model
  (`src/lib/providers/llm/anthropic.ts::buildUserContent`).
