import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { db } from "@/lib/db/client";

export default async function MentionsPage() {
  const mentions = await db.mention.findMany({
    orderBy: { observedAt: "desc" },
    take: 300,
    include: { company: { select: { id: true, name: true } }, person: { select: { id: true, name: true } } },
  });

  return (
    <div className="pb-10">
      <PageHeader
        title="Mentions"
        subtitle="Chronological intelligence stream — everything SourceOS learned, inferred, or you decided."
      />

      <section className="px-6 pt-4">
        {mentions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
            No mentions yet.
          </div>
        ) : (
          <div className="max-h-[calc(100dvh-10rem)] space-y-0 overflow-y-auto rounded-lg border border-border p-4">
            {mentions.map((m, i) => (
              <div key={m.id} className="flex gap-3 pb-3 last:pb-0">
                <div className="flex flex-col items-center">
                  <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-foreground/60" />
                  {i < mentions.length - 1 && <span className="w-px flex-1 bg-border" />}
                </div>
                <div className="-mt-0.5 min-w-0 pb-1">
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span>{m.observedAt.toLocaleString()}</span>
                    <span className="rounded border border-border px-1 py-0 text-[9px]">
                      {m.evidenceType}
                    </span>
                    <span className="rounded border border-border px-1 py-0 text-[9px]">
                      {m.type}
                    </span>
                    <span>{m.author}</span>
                    {m.company && (
                      <Link href={`/companies/${m.company.id}`} className="font-medium text-foreground hover:underline">
                        {m.company.name}
                      </Link>
                    )}
                    {m.person && <span className="font-medium text-foreground">{m.person.name}</span>}
                  </div>
                  <div className="text-xs">{m.body}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
