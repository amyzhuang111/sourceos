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

function durationLabel(startedAt: Date, completedAt: Date | null): string {
  if (!completedAt) return "—";
  const ms = completedAt.getTime() - startedAt.getTime();
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default async function RunsPage() {
  const runs = await db.agentRun.findMany({
    orderBy: { startedAt: "desc" },
    take: 200,
  });

  return (
    <div className="pb-10">
      <PageHeader
        title="Runs"
        subtitle="Every automated action, auditable. Nothing here happens outside a traceable run."
      />

      <section className="px-6 pt-4">
        {runs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
            No agent runs yet. Runs are created when you research a company.
          </div>
        ) : (
          <div className="max-h-[calc(100dvh-10rem)] overflow-y-auto rounded-lg border border-border">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background">
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead className="text-right">Duration</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs font-medium">{r.agent}</TableCell>
                    <TableCell className="max-w-[280px] truncate text-xs text-muted-foreground">
                      {r.task ?? "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={r.status} />
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">
                      {r.model ?? "—"}
                    </TableCell>
                    <TableCell className="text-right text-xs tabular-nums">
                      {durationLabel(r.startedAt, r.completedAt)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {r.startedAt.toLocaleString()}
                    </TableCell>
                    <TableCell className="max-w-[240px] truncate text-xs text-red-600">
                      {r.errors ? JSON.stringify(r.errors) : ""}
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
