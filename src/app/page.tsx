import Link from "next/link";
import { ArrowRight, FlaskConical } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPriorityFeed, parseScoreReasoning } from "@/lib/companies/feed";
import { decideAction, runResearchAction } from "@/app/companies/actions";
import type { CompanyStatus } from "@/generated/prisma/client";

const DECISION_BUTTONS: { value: string; label: string }[] = [
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
  { value: "PASS", label: "Pass" },
  { value: "TRACK", label: "Track" },
];

function nextAction(status: CompanyStatus, hasScore: boolean): string {
  if (status === "NEW") return "Run research";
  if (!hasScore) return "Run research";
  if (status === "RESEARCHING" || status === "REVIEW") return "Make a decision";
  if (status === "TRACKING") return "Re-research when something changes";
  if (status === "HIGH") return "Move toward contact/meet";
  return "No action needed";
}

function timeAgo(date: Date): string {
  const ms = Date.now() - date.getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

export default async function PriorityFeedPage() {
  const companies = await getPriorityFeed();

  return (
    <div className="pb-10">
      <PageHeader
        title="Priority Feed"
        subtitle="What are the most interesting companies to look at right now, why, and what should I do next?"
      />

      <section className="space-y-3 px-6 pt-5">
        {companies.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
            No companies yet.{" "}
            <Link href="/discover" className="font-medium text-foreground hover:underline">
              Add one via Discover
            </Link>
            .
          </div>
        ) : (
          companies.map((company) => {
            const score = company.scores[0];
            const latestMention = company.mentions[0];
            const decision = company.decisions[0];
            const reasoning = parseScoreReasoning(score?.reasoning ?? null);
            const sectors = (company.sectors as string[]) ?? [];

            return (
              <div key={company.id} className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/companies/${company.id}`}
                        className="text-sm font-semibold hover:underline"
                      >
                        {company.name}
                      </Link>
                      <StatusBadge status={company.status} />
                      <Badge variant="outline" className="text-[11px]">
                        {company.stage.replace("_", "-")}
                      </Badge>
                      {company.headquarters && (
                        <span className="text-[11px] text-muted-foreground">
                          {company.headquarters}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {company.description ?? "No description yet — run research to generate one."}
                    </p>
                    {sectors.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {sectors.map((s) => (
                          <span
                            key={s}
                            className="rounded-md border border-border bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1 text-right">
                    {score ? (
                      <>
                        <div className="text-lg font-semibold tabular-nums">
                          {score.weightedScore.toFixed(1)}
                          <span className="text-xs font-normal text-muted-foreground">/10</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          confidence {Math.round(score.confidence * 100)}%
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-muted-foreground">Not scored</div>
                    )}
                  </div>
                </div>

                {(reasoning.topPositives?.length || reasoning.topConcerns?.length) && (
                  <div className="mt-3 grid grid-cols-2 gap-4 border-t border-border pt-3 text-xs">
                    {reasoning.topPositives && reasoning.topPositives.length > 0 && (
                      <div>
                        <div className="font-medium text-emerald-700 dark:text-emerald-400">
                          Why this is interesting
                        </div>
                        <ul className="mt-1 space-y-0.5">
                          {reasoning.topPositives.slice(0, 3).map((p, i) => (
                            <li key={i} className="flex gap-1.5 text-muted-foreground">
                              <span className="text-emerald-600">+</span>
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {reasoning.topConcerns && reasoning.topConcerns.length > 0 && (
                      <div>
                        <div className="font-medium text-red-700 dark:text-red-400">
                          Biggest concern
                        </div>
                        <p className="mt-1 text-muted-foreground">{reasoning.topConcerns[0]}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                    <span>First seen {timeAgo(company.firstSeenAt)}</span>
                    {latestMention && (
                      <span>
                        Latest: {latestMention.body.slice(0, 60)}
                        {latestMention.body.length > 60 ? "…" : ""}
                      </span>
                    )}
                    {decision && (
                      <span>
                        Decided <span className="font-medium">{decision.decision}</span>
                      </span>
                    )}
                    <span className="font-medium text-foreground">
                      Next: {nextAction(company.status, !!score)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <form action={runResearchAction}>
                      <input type="hidden" name="companyId" value={company.id} />
                      <Button type="submit" variant="outline" size="xs">
                        <FlaskConical className="size-3" />
                        {score ? "Re-research" : "Research"}
                      </Button>
                    </form>
                    <form action={decideAction} className="flex items-center gap-1">
                      <input type="hidden" name="companyId" value={company.id} />
                      {DECISION_BUTTONS.map((btn) => (
                        <Button
                          key={btn.value}
                          type="submit"
                          name="decision"
                          value={btn.value}
                          variant="ghost"
                          size="xs"
                        >
                          {btn.label}
                        </Button>
                      ))}
                    </form>
                    <Button asChild variant="outline" size="xs">
                      <Link href={`/companies/${company.id}`}>
                        Open
                        <ArrowRight className="size-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
