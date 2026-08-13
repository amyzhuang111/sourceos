import Link from "next/link";
import { notFound } from "next/navigation";
import { FlaskConical, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCompanyDetail } from "@/lib/companies/create";
import { parseScoreReasoning } from "@/lib/companies/feed";
import { decideAction, runResearchAction } from "@/app/companies/actions";

const DECISION_BUTTONS: { value: string; label: string }[] = [
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
  { value: "PASS", label: "Pass" },
  { value: "CONTACT", label: "Contact" },
  { value: "MEET", label: "Meet" },
  { value: "TRACK", label: "Track" },
];

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = await getCompanyDetail(id);
  if (!company) notFound();

  const snapshot = company.researchSnapshots[0];
  const score = company.scores[0];
  const reasoning = parseScoreReasoning(score?.reasoning ?? null);
  const sectors = (company.sectors as string[]) ?? [];
  const openQuestions = (snapshot?.openQuestions as string[]) ?? [];
  const evidence = (snapshot?.evidence as { claim: string; evidenceType: string; sourceUrl?: string; sourceName?: string }[]) ?? [];

  return (
    <div className="pb-10">
      <PageHeader
        title={company.name}
        subtitle={company.canonicalDomain}
        breadcrumbs={[{ label: "Companies", href: "/companies" }, { label: company.name }]}
        badges={
          <>
            <StatusBadge status={company.status} />
            <Badge variant="outline">{company.stage.replace("_", "-")}</Badge>
          </>
        }
        actions={
          <div className="flex items-center gap-1.5">
            {company.website && (
              <Button asChild variant="outline" size="sm">
                <a href={company.website} target="_blank" rel="noopener noreferrer">
                  Website
                  <ExternalLink className="size-3.5" />
                </a>
              </Button>
            )}
            <form action={runResearchAction}>
              <input type="hidden" name="companyId" value={company.id} />
              <Button type="submit" size="sm">
                <FlaskConical className="size-3.5" />
                {snapshot ? "Re-research" : "Run research"}
              </Button>
            </form>
          </div>
        }
      />

      <section className="grid grid-cols-4 gap-3 px-6 pt-5">
        <Kpi label="Weighted score" value={score ? `${score.weightedScore.toFixed(1)}/10` : "—"} />
        <Kpi
          label="Confidence"
          value={score ? `${Math.round(score.confidence * 100)}%` : "—"}
        />
        <Kpi label="Priority" value={company.priority != null ? company.priority.toFixed(2) : "—"} />
        <Kpi
          label="Decision"
          value={company.decisions[0]?.decision ?? "None yet"}
        />
      </section>

      <section className="mt-4 px-6">
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-3">
          <span className="text-xs font-medium text-muted-foreground">Record a decision:</span>
          <form action={decideAction} className="flex flex-wrap items-center gap-1.5">
            <input type="hidden" name="companyId" value={company.id} />
            {DECISION_BUTTONS.map((btn) => (
              <Button key={btn.value} type="submit" name="decision" value={btn.value} variant="outline" size="xs">
                {btn.label}
              </Button>
            ))}
          </form>
        </div>
      </section>

      {sectors.length > 0 && (
        <section className="mt-3 flex flex-wrap gap-1.5 px-6">
          {sectors.map((s) => (
            <span
              key={s}
              className="rounded-md border border-border bg-muted/50 px-1.5 py-0.5 text-[11px] text-muted-foreground"
            >
              {s}
            </span>
          ))}
        </section>
      )}

      <section className="mt-5 grid grid-cols-5 gap-4 px-6">
        <div className="col-span-3 space-y-4">
          {!snapshot ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No research yet. Click &quot;Run research&quot; above to generate an evidence-backed
              snapshot.
            </div>
          ) : (
            <>
              <Section title="Summary">{snapshot.summary}</Section>
              <div className="grid grid-cols-2 gap-4">
                <Section title="What it does">{snapshot.product ?? "Unknown"}</Section>
                <Section title="Problem">{snapshot.problem ?? "Unknown"}</Section>
                <Section title="Why now">{snapshot.whyNow ?? "Unknown"}</Section>
                <Section title="Market / competitors">
                  {[snapshot.market, snapshot.competition].filter(Boolean).join(" ") || "Unknown"}
                </Section>
                <Section title="Founders">{snapshot.founders ?? "Unknown"}</Section>
                <Section title="Technical depth">{snapshot.technicalDepth ?? "Unknown"}</Section>
                <Section title="Traction">{snapshot.traction ?? "Unknown"}</Section>
                <Section title="Distribution">{snapshot.distribution ?? "Unknown"}</Section>
              </div>
              <Section title="Risks / unknowns">{snapshot.risks ?? "Unknown"}</Section>

              {openQuestions.length > 0 && (
                <div className="rounded-lg border border-border p-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Open questions
                  </h3>
                  <ul className="mt-1.5 space-y-1 text-xs">
                    {openQuestions.map((q, i) => (
                      <li key={i} className="flex gap-1.5">
                        <span className="text-muted-foreground">•</span>
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {score && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/30">
                  <h3 className="text-xs font-semibold text-blue-800 dark:text-blue-400">
                    Thesis match
                  </h3>
                  {reasoning.topPositives && (
                    <div className="mt-1.5">
                      <div className="text-[11px] font-medium text-blue-800 dark:text-blue-400">
                        Top positives
                      </div>
                      <ul className="mt-0.5 space-y-0.5 text-xs text-blue-900/90 dark:text-blue-300/90">
                        {reasoning.topPositives.map((p, i) => (
                          <li key={i}>+ {p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {reasoning.topConcerns && (
                    <div className="mt-1.5">
                      <div className="text-[11px] font-medium text-blue-800 dark:text-blue-400">
                        Top concerns
                      </div>
                      <ul className="mt-0.5 space-y-0.5 text-xs text-blue-900/90 dark:text-blue-300/90">
                        {reasoning.topConcerns.map((p, i) => (
                          <li key={i}>− {p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {reasoning.contrarianCase && (
                    <div className="mt-1.5">
                      <div className="text-[11px] font-medium text-blue-800 dark:text-blue-400">
                        Contrarian case
                      </div>
                      <p className="mt-0.5 text-xs text-blue-900/90 dark:text-blue-300/90">
                        {reasoning.contrarianCase}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="col-span-2 space-y-4">
          {evidence.length > 0 && (
            <div className="rounded-lg border border-border p-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Evidence / sources
              </h3>
              <ul className="mt-1.5 space-y-2">
                {evidence.map((e, i) => (
                  <li key={i} className="text-xs">
                    <span
                      className={`mr-1.5 rounded border px-1 py-0.5 text-[10px] font-medium ${
                        e.evidenceType === "FACT"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400"
                      }`}
                    >
                      {e.evidenceType}
                    </span>
                    {e.claim}
                    {e.sourceUrl && (
                      <a
                        href={e.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1 text-muted-foreground hover:underline"
                      >
                        [{e.sourceName ?? "source"}]
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Timeline
              </h3>
              <span className="text-[11px] text-muted-foreground">
                {company.mentions.length} mentions
              </span>
            </div>
            <div className="mt-2 max-h-[420px] space-y-0 overflow-y-auto pr-1">
              {company.mentions.length === 0 ? (
                <p className="text-xs text-muted-foreground">No mentions yet.</p>
              ) : (
                company.mentions.map((m, i) => (
                  <div key={m.id} className="flex gap-3 pb-3 last:pb-0">
                    <div className="flex flex-col items-center">
                      <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-foreground/60" />
                      {i < company.mentions.length - 1 && (
                        <span className="w-px flex-1 bg-border" />
                      )}
                    </div>
                    <div className="-mt-0.5 min-w-0">
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <span>{m.observedAt.toLocaleString()}</span>
                        <span className="rounded border border-border px-1 py-0 text-[9px]">
                          {m.evidenceType}
                        </span>
                        <span className="text-muted-foreground">{m.author}</span>
                      </div>
                      <div className="text-xs">{m.body}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {company.researchSnapshots.length > 1 && (
            <div className="rounded-lg border border-border p-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Previous research snapshots
              </h3>
              <ul className="mt-1.5 space-y-1 text-xs">
                {company.researchSnapshots.map((s) => (
                  <li key={s.id} className="flex items-center justify-between">
                    <span>v{s.version}</span>
                    <span className="text-muted-foreground">
                      {s.generatedAt.toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-lg border border-border p-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              People
            </h3>
            {company.people.length === 0 ? (
              <p className="mt-1 text-xs text-muted-foreground">
                No linked people yet — the people-researcher agent isn&apos;t built in this
                session.
              </p>
            ) : (
              <ul className="mt-1.5 space-y-1 text-xs">
                {company.people.map((p) => (
                  <li key={p.id}>
                    <Link href={`/people`} className="hover:underline">
                      {p.name}
                    </Link>{" "}
                    {p.role && <span className="text-muted-foreground">— {p.role}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card px-4 py-3">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold tracking-tight tabular-nums">{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <p className="mt-1 text-xs leading-relaxed">{children}</p>
    </div>
  );
}
