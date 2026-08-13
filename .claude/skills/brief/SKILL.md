---
name: brief
description: Generate a concise daily investor briefing — top new companies, important changes, score movements, companies needing a decision, suggested next actions. NOT YET IMPLEMENTED as a scheduled job, but every input query works today.
---

# /brief

Intended output shape (`DailyBriefSchema`, `src/lib/schemas/brief.ts`):
top 5 new companies, top 5 important changes, companies with material score
changes, companies needing a decision, suggested next actions.

## Current state: not implemented as a job

No `scripts/daily-brief.ts`. But every query this needs already exists as a
Prisma call — this is mostly assembly, not new capability:

- **Top new companies**: `db.company.findMany({ where: { firstSeenAt: {
  gte: since } }, orderBy: { priority: "desc" } })`
- **Companies needing a decision**: companies with a `Score` but no
  `Decision` — `db.company.findMany({ where: { scores: { some: {} },
  decisions: { none: {} } } })`
- **Material score changes**: compare the two most recent `Score` rows per
  company (`db.score.findMany({ where: { companyId }, orderBy: { createdAt:
  "desc" }, take: 2 })`)
- **Recent important changes**: `db.mention.findMany({ where: { observedAt:
  { gte: since }, evidenceType: "AGENT_ANALYSIS" } })`

## If implementing this

Assemble the above into `DailyBriefSchema`, either with a final LLM pass to
write the "suggested next actions" prose or entirely from deterministic
queries — the schema doesn't require an LLM call for every field. Write it as
`scripts/daily-brief.ts` (`tsx`, matching `prisma/seed.ts`'s pattern) so it's
usable as a `pnpm brief:daily` cron entrypoint per CLAUDE.md's Automation
section.
