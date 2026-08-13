# SourceOS — Build Plan

This documents the implementation plan for the first build session, and what
actually got built against it. Written per CLAUDE.md's "First task"
instructions. Update this file at the start of future sessions rather than
starting a parallel plan doc.

## Scope decision for this session

CLAUDE.md describes a very large system (20+ sourcing strategies, 7 subagents,
autonomous cron jobs, taste learning). Building all of it in one session isn't
realistic. The scope was cut deliberately, in CLAUDE.md's own priority order:
get Phase 1–3 (the manual, human-in-the-loop intelligence loop) fully working
and real — no mocked LLM calls, no fake data standing in for a working
feature — before touching Phase 4–7 (autonomous sourcing, monitoring, taste
learning, hardening). See "What's NOT built" below for the honest boundary.

## Phase 1 — Foundation ✅

- Next.js App Router + TypeScript strict + Tailwind + shadcn/ui (`radix-nova`
  preset), scaffolded fresh (not layered onto an existing repo).
- Prisma + SQLite (`@prisma/adapter-better-sqlite3`) as the zero-config local
  datasource per CLAUDE.md. Full data model in `prisma/schema.prisma`:
  Company, Person, FundingEvent, Signal, Mention, ResearchSnapshot, Score,
  Thesis, Decision, TasteProposal, SourceProposal, AgentRun.
  - SQLite has no native list type — CLAUDE.md's `x[]` fields are `Json?`
    columns, not `String[]`. Switching to Postgres later means changing the
    datasource and converting those columns; noted in the schema header.
  - Hit and fixed a real Prisma 7 bug along the way: `@default("[]")` on a
    SQLite `Json` column generates invalid raw SQL (`DEFAULT []`, not
    `DEFAULT '[]'`) and the migration fails at that statement. Fixed by
    making those columns nullable with no DB-level default instead.
- `config/default-thesis.ts` + `prisma/seed.ts` — seeds the default Thesis
  (required for scoring to run at all) and 6 clearly-fictional demo companies
  spanning NEW / RESEARCHING / HIGH / TRACKING / PASS, including one with
  deliberately conflicting evidence, per CLAUDE.md's seed-data spec.
- Provider interfaces (`lib/providers/llm`, `lib/providers/search`):
  `LLMProvider` (Anthropic adapter, default model `claude-sonnet-5`,
  structured-output via Zod + one retry on schema mismatch, `refusal`
  stop-reason handling) and `SearchProvider` (Exa adapter, optional, plus a
  manual/no-key fallback so the app boots without it).
- Pure functions with Vitest unit tests (40 tests, all passing):
  `lib/identity/canonicalize.ts` (domain canonicalization for dedup),
  `lib/scoring/priority.ts` (weighted score aggregation, freshness/novelty
  factors, the `priority = weighted_score × confidence × freshness × novelty
  × actionability` formula), `lib/scoring/discovery.ts` (DiscoveryScore),
  `lib/jobs/sourcingQueue.ts` (the DISCOVERED → ... → USER_REVIEW state
  machine, including that failure states are terminal).
- Core Zod schemas (`lib/schemas/`) for every LLM-driven write: candidate
  company, research snapshot + evidence, score dimensions, signal, mention,
  taste proposal, daily brief. LLM output is never parsed from prose that
  drives a DB write — it always goes through one of these.

## Phase 2 — Manual intelligence loop ✅

- `addCompanyByUrl` — idempotent on canonical domain (re-adding an existing
  company opens it instead of duplicating).
- `runResearch(companyId)` — the real pipeline: fetches the company's public
  homepage (`lib/research/fetchWebsite.ts`, plain-text extraction, no
  external HTML parser dependency, honors `robots.txt` disallow rules before
  fetching), runs the company-analyst prompt through `LLMProvider` with the
  `ResearchSnapshotSchema`, persists a versioned `ResearchSnapshot` +
  `Mention` rows for every evidence item, then runs the thesis-matcher prompt
  against the active `Thesis` with `ScoreDimensionsSchema`, computes the
  weighted score deterministically (never by the LLM), and updates the
  company's derived `priority`. Every step is wrapped in an `AgentRun` row
  (`lib/jobs/agentRun.ts`) so it's auditable and fails loudly, not silently.
- `recordDecision` — Decision row + status update + `USER_DECISION` mention,
  all in one place so every decision is both structured data and an entry in
  the mention timeline.
- Company detail page: header/status/score, what it does, why now, evidence
  with FACT/INFERENCE tags and source links, founders, market/competitors,
  thesis match (top positives/concerns/contrarian case), risks/open
  questions, full mention timeline, previous snapshot versions, decision
  buttons, Run research button.
- Verified end-to-end against the real SQLite database (not mocked): add →
  idempotent re-add → decide → research-fails-cleanly-without-a-key, then
  confirmed in the actual rendered HTML of the running dev server.

## Phase 3 — Investor workflow ✅ (partial)

- Priority Feed (`/`) — ranked by `priority`, each card shows score,
  confidence, why-it's-interesting / biggest-concern, latest mention, next
  recommended action, and inline decision buttons (High/Medium/Low/Pass/Track)
  plus Research, all as plain `<form action={serverAction}>` — no client JS
  required for the core loop.
- Companies (`/companies`) — status filter chips + text search.
- Thesis editor (`/thesis`) — edits sectors/stages/signals/exclusions/weights;
  saving creates a new version rather than mutating history, so there's a
  version trail.
- Feedback (`/feedback`) — decision history; TasteProposal list is present
  but will be empty until Phase 6's taste-critic exists.
- Mentions (`/mentions`) — full chronological stream across companies.
- Runs (`/runs`) — every AgentRun, including failures, for the audit trail
  CLAUDE.md's Observability section asks for.
- People (`/people`), Settings (`/settings`) — built as real, working shells:
  People is genuinely empty (no people-researcher agent yet, not faked data),
  Settings reports live provider-configured status read from `process.env`.

## What's NOT built (honest gap, not silently skipped)

- **Phase 4 — Scout / autonomous sourcing.** No source adapters beyond the
  Exa `SearchProvider` stub, no `config/sources.yaml`, no
  `docs/SOURCING_UNIVERSE.md`, no sourcing strategies A–N, no
  `/settings/sources` UI, no Discover page modes beyond manual URL import.
  This is the single largest remaining scope item — CLAUDE.md's own "MVP
  source priority" section describes this as 10+ adapters even at Wave 1.
- **Phase 5 — Continuous intelligence.** No `signal-monitor` job, no cron
  scripts (`scripts/daily-source.ts` etc. don't exist — deliberately not
  added to `package.json` so there's nothing pointing at a missing file), no
  `/brief` daily briefing generation.
- **Phase 6 — Taste learning.** No `taste-critic` agent, no `/reflect`,
  TasteProposal accept/reject UI doesn't exist (the table and the Feedback
  page's empty state do).
- **`people-researcher` agent** isn't wired into the research pipeline —
  `ResearchSnapshot.founders` is a free-text field from company-analyst
  instead of structured `Person` rows.
- **`.claude/agents/*.md` and `.claude/skills/*/SKILL.md`** are written as
  real Claude Code subagent/skill definitions (usable if someone runs Claude
  Code against this repo), but only `company-analyst` and `thesis-matcher`
  additionally have a hand-written TypeScript implementation
  (`lib/research/run.ts`) wired into the product itself. The others describe
  intended behavior for Phase 4+ work, not yet automated.
- **Phase 7 — Hardening.** No Playwright E2E tests (Vitest unit coverage
  only), no explicit loading states beyond Next's default streaming,
  accessibility/performance passes not done.

## Next highest-leverage step

Build the Discover page's second sourcing mode: a single generic
`SearchProvider`-backed campaign (Strategy C, "Fresh Financing" or Strategy J,
"Thesis Search" are the cheapest to stand up given Exa is already wired) that
writes real `Signal` + candidate `Company` rows through the existing
`SourcingQueueStatus` state machine, rather than adding more UI to a system
that still only has one way to discover a company.
