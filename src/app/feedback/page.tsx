import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { db } from "@/lib/db/client";

export default async function FeedbackPage() {
  const decisions = await db.decision.findMany({
    orderBy: { decidedAt: "desc" },
    take: 200,
    include: { company: { select: { id: true, name: true } } },
  });
  const proposals = await db.tasteProposal.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="pb-10">
      <PageHeader
        title="Feedback"
        subtitle="Decisions and taste-learning proposals. Taste changes are never applied automatically."
      />

      <section className="mt-5 grid grid-cols-5 gap-4 px-6">
        <div className="col-span-3">
          <h2 className="mb-2 text-sm font-semibold">Decisions</h2>
          {decisions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-10 text-center text-xs text-muted-foreground">
              No decisions recorded yet.
            </div>
          ) : (
            <div className="max-h-[calc(100dvh-14rem)] overflow-y-auto rounded-lg border border-border">
              {decisions.map((d) => (
                <div key={d.id} className="flex items-start justify-between gap-3 border-b border-border p-3 last:border-b-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <Link href={`/companies/${d.company.id}`} className="text-sm font-medium hover:underline">
                        {d.company.name}
                      </Link>
                      <StatusBadge status={d.decision} />
                    </div>
                    {d.reason && <p className="mt-0.5 text-xs text-muted-foreground">{d.reason}</p>}
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {d.decidedAt.toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-span-2">
          <h2 className="mb-2 text-sm font-semibold">Taste proposals</h2>
          {proposals.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-10 text-center text-xs text-muted-foreground">
              None yet. The taste-critic agent (learns from decisions and proposes thesis/weight
              changes for you to accept or reject) isn&apos;t implemented in this session — see
              /reflect in AGENTS.md for the intended flow.
            </div>
          ) : (
            <div className="space-y-2">
              {proposals.map((p) => (
                <div key={p.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{p.proposedChange}</span>
                    <StatusBadge status={p.status} />
                  </div>
                  {p.confidence != null && (
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      confidence {Math.round(p.confidence * 100)}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
