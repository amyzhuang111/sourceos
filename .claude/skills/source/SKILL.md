---
name: source
description: Discover new companies matching a thesis/stage/sector/geography. NOT YET IMPLEMENTED as an automated pipeline — see below for the honest current state and the manual fallback.
---

# /source

Arguments per CLAUDE.md: `thesis`, `stage`, `sector`, `geography`, `source`,
`limit`. Intended pipeline: Scout → dedupe → lightweight enrichment →
preliminary ranking → save.

## Current state: not implemented

There is no `config/sources.yaml`, no source adapters beyond the optional Exa
`SearchProvider` (`src/lib/providers/search/exa.ts`, unused by any agent),
and no Scout implementation. This is honestly the largest missing piece —
see `docs/BUILD_PLAN.md` for what a real Wave 1 (10 adapters) would take.

## What actually works today

Manual URL import, one company at a time, via the `/discover` page or
directly:

```ts
import { addCompanyByUrl } from "./src/lib/companies/create";
const { company, wasExisting } = await addCompanyByUrl(url, { source: "manual" });
```

It's idempotent on canonical domain (`src/lib/identity/canonicalize.ts`) —
re-adding a known company returns the existing row rather than duplicating
it, so it's safe to call from a loop over a hand-curated list.

## If you're asked to implement real discovery

Start with the scout agent definition (`.claude/agents/scout.md`) and MVP
Wave 1 from CLAUDE.md: a generic `SearchProvider`-backed campaign is the
cheapest real win given Exa is already wired — write results through
`addCompanyByUrl` (for dedup) and the `SourcingQueueStatus` state machine
(`src/lib/jobs/sourcingQueue.ts`) rather than inserting `Company` rows
directly.
