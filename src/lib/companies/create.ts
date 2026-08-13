import { db } from "@/lib/db/client";
import { canonicalizeDomain } from "@/lib/identity/canonicalize";
import type { Company } from "@/generated/prisma/client";

export interface AddCompanyResult {
  company: Company;
  wasExisting: boolean;
}

/**
 * Phase 2 core loop entry point: add a company by URL. Idempotent on
 * canonicalDomain — re-adding an already-known company returns it rather
 * than creating a duplicate (CLAUDE.md: identity resolution before dedupe).
 */
export async function addCompanyByUrl(
  rawUrl: string,
  opts: { name?: string; source?: string } = {}
): Promise<AddCompanyResult> {
  const canonicalDomain = canonicalizeDomain(rawUrl);
  const website = rawUrl.includes("://") ? rawUrl : `https://${rawUrl}`;

  const existing = await db.company.findUnique({ where: { canonicalDomain } });
  if (existing) {
    return { company: existing, wasExisting: true };
  }

  const name = opts.name?.trim() || canonicalDomain;

  const company = await db.company.create({
    data: {
      name,
      canonicalDomain,
      website,
      status: "NEW",
      sourcingStatus: "IDENTITY_RESOLVED",
      firstSeenSource: opts.source ?? "manual",
      firstSeenStrategy: "manual_add",
      discoveredBy: [opts.source ?? "manual"],
      mentions: {
        create: {
          type: "candidate_added",
          body: `Added manually via URL: ${website}`,
          evidenceType: "USER_NOTE",
          observedAt: new Date(),
          author: "user",
        },
      },
    },
  });

  return { company, wasExisting: false };
}

export async function listCompanies(opts: { status?: string; limit?: number } = {}) {
  return db.company.findMany({
    where: opts.status ? { status: opts.status as never } : undefined,
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    take: opts.limit ?? 200,
  });
}

export async function getCompanyDetail(companyId: string) {
  return db.company.findUnique({
    where: { id: companyId },
    include: {
      people: true,
      fundingEvents: { orderBy: { announcedAt: "desc" } },
      signals: { orderBy: { observedAt: "desc" } },
      mentions: { orderBy: { observedAt: "desc" } },
      researchSnapshots: { orderBy: { version: "desc" } },
      scores: { orderBy: { createdAt: "desc" } },
      decisions: { orderBy: { decidedAt: "desc" } },
    },
  });
}
