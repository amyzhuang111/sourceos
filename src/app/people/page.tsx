import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { db } from "@/lib/db/client";

export default async function PeoplePage() {
  const people = await db.person.findMany({
    orderBy: { createdAt: "desc" },
    include: { company: { select: { id: true, name: true } } },
  });

  return (
    <div className="pb-10">
      <PageHeader title="People" subtitle="Founders and key people linked to companies you're tracking." />

      <section className="px-6 pt-4">
        {people.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
            No people yet. The people-researcher agent (CLAUDE.md&apos;s founder/key-person
            research) isn&apos;t implemented in this session — companies&apos; research snapshots
            include a free-text &quot;Founders&quot; field instead of structured Person records.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {people.map((p) => (
              <div key={p.id} className="rounded-lg border border-border p-3">
                <div className="text-sm font-semibold">{p.name}</div>
                {p.role && <div className="text-xs text-muted-foreground">{p.role}</div>}
                {p.company && (
                  <Link
                    href={`/companies/${p.company.id}`}
                    className="mt-1 inline-block text-xs text-muted-foreground hover:underline"
                  >
                    {p.company.name}
                  </Link>
                )}
                {p.location && <div className="mt-1 text-[11px] text-muted-foreground">{p.location}</div>}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
