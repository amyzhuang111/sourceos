---
name: monitor
description: Refresh tracked/high-priority companies and create only genuinely new signals. NOT YET IMPLEMENTED as a scheduled job — manual re-research works today.
---

# /monitor

Intended: run signal-monitor over TRACKING/HIGH/MEDIUM companies, creating
new `Signal`/`Mention` rows only for what's actually changed since the last
check.

## Current state: not implemented

No `scripts/daily-monitor.ts`, no cheap incremental-check path — only a full
re-research exists.

## Manual fallback

```ts
import { db } from "./src/lib/db/client";
import { runResearch } from "./src/lib/research/run";

const companies = await db.company.findMany({
  where: { status: { in: ["TRACKING", "HIGH", "MEDIUM"] } },
});

for (const c of companies) {
  await runResearch(c.id); // full re-research, not a cheap incremental check
}
```

This is expensive (a full LLM research pass per company, plus a fresh
`ResearchSnapshot` version even if nothing changed) — fine for a handful of
companies run by hand, not a substitute for a real signal-monitor.
