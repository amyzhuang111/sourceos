---
name: review-portfolio
description: Given a VC/accelerator/company list, find relevant companies not already in SourceOS and rank them. NOT YET IMPLEMENTED — see below for the manual fallback.
---

# /review-portfolio

Intended: take a list of company names/URLs (e.g. a fund's portfolio page),
diff against what's already in SourceOS, and rank the new ones by fit.

## Current state: not implemented

No portfolio-diffing adapter exists (CLAUDE.md's "VC portfolio diffing"
sourcing strategy, Phase 4). No snapshotting of fund portfolio pages between
runs, so there's no way to detect "newly added" yet.

## Manual fallback

Given a list of URLs, for each one not already known:

```ts
import { addCompanyByUrl } from "./src/lib/companies/create";
import { runResearch } from "./src/lib/research/run";

for (const url of urls) {
  const { company, wasExisting } = await addCompanyByUrl(url, { source: "portfolio_review" });
  if (!wasExisting) await runResearch(company.id);
}
```

`wasExisting` is exactly the diff signal a real implementation would need —
it's already computed by `addCompanyByUrl`'s canonical-domain lookup, just
not persisted as a portfolio snapshot over time.
