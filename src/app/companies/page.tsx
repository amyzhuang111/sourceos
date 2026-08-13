import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/lib/db/client";
import type { CompanyStatus } from "@/generated/prisma/client";

const STATUSES: CompanyStatus[] = [
  "NEW",
  "RESEARCHING",
  "REVIEW",
  "HIGH",
  "MEDIUM",
  "LOW",
  "PASS",
  "CONTACTED",
  "MEETING",
  "TRACKING",
  "ARCHIVED",
];

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;

  const companies = await db.company.findMany({
    where: {
      ...(status ? { status: status as CompanyStatus } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { canonicalDomain: { contains: q } },
              { description: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    take: 500,
  });

  const buildHref = (next: { q?: string; status?: string }) => {
    const params = new URLSearchParams();
    const nq = next.q ?? q;
    const nstatus = next.status ?? status;
    if (nq) params.set("q", nq);
    if (nstatus) params.set("status", nstatus);
    const qs = params.toString();
    return qs ? `/companies?${qs}` : "/companies";
  };

  return (
    <div className="pb-10">
      <PageHeader title="Companies" subtitle={`${companies.length} companies matching current filters`} />

      <section className="flex flex-wrap items-center gap-2 border-b border-border px-6 py-3">
        <form className="flex items-center gap-2" action="/companies">
          {status && <input type="hidden" name="status" value={status} />}
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search name, domain, description…"
            className="h-8 w-64 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </form>
        <div className="flex flex-wrap items-center gap-1">
          <Link
            href={buildHref({ status: undefined })}
            className={`rounded-md border px-2 py-1 text-[11px] font-medium ${
              !status ? "border-foreground bg-muted" : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            All
          </Link>
          {STATUSES.map((s) => (
            <Link
              key={s}
              href={buildHref({ status: s })}
              className={`rounded-md border px-2 py-1 text-[11px] font-medium ${
                status === s ? "border-foreground bg-muted" : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {s}
            </Link>
          ))}
        </div>
      </section>

      <section className="px-6 pt-4">
        {companies.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
            No companies match these filters.
          </div>
        ) : (
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead className="text-right">Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>First seen</TableHead>
                  <TableHead>Last researched</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="p-0">
                      <Link
                        href={`/companies/${c.id}`}
                        className="block px-2 py-2 font-medium hover:underline"
                      >
                        {c.name}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {c.canonicalDomain}
                    </TableCell>
                    <TableCell className="text-xs">{c.stage.replace("_", "-")}</TableCell>
                    <TableCell className="text-right text-xs tabular-nums">
                      {c.priority != null ? c.priority.toFixed(2) : "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={c.status} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {c.firstSeenAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {c.lastResearchedAt ? c.lastResearchedAt.toLocaleDateString() : "Never"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
