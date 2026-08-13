import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { addCompanyAction } from "./actions";

const PLANNED_MODES = [
  { name: "VC portfolio scan", note: "Phase 4 — requires source adapters, not yet built." },
  { name: "Accelerator batch scan", note: "Phase 4 — requires source adapters, not yet built." },
  { name: "Free-form thesis prompt", note: "Phase 4 — Thesis Search strategy, not yet built." },
  { name: "Competitor adjacency search", note: "Phase 4 — Similar-to-High strategy, not yet built." },
];

export default function DiscoverPage() {
  return (
    <div className="pb-10">
      <PageHeader
        title="Discover"
        subtitle="Add a company by URL. Pipeline: Found → Deduped → Enriched → Researched → Scored → Saved."
      />

      <section className="grid grid-cols-5 gap-6 px-6 pt-5">
        <div className="col-span-2 rounded-lg border border-border p-4">
          <h2 className="text-sm font-semibold">Add company by URL</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            The only sourcing mode implemented so far (MVP Wave 1). Identity is resolved by
            canonical domain — re-adding a known company opens the existing record instead of
            duplicating it.
          </p>
          <form action={addCompanyAction} className="mt-4 space-y-3">
            <div className="space-y-1">
              <Label htmlFor="url">Company URL</Label>
              <Input id="url" name="url" placeholder="https://acme.com" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="name">Name (optional)</Label>
              <Input id="name" name="name" placeholder="Defaults to the domain" />
            </div>
            <label className="flex items-center gap-2 text-xs">
              <Checkbox name="runNow" defaultChecked />
              Run research immediately after adding
            </label>
            <Button type="submit" className="w-full">
              Add company
            </Button>
          </form>
        </div>

        <div className="col-span-3 rounded-lg border border-border p-4">
          <h2 className="text-sm font-semibold">Other sourcing modes</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            CLAUDE.md&apos;s full sourcing engine (accelerator sweeps, VC portfolio diffing, SEC
            Form D, GitHub breakout detection, hiring signals, and more) is a large surface not
            yet implemented in this session — honestly reported here rather than faked.
          </p>
          <div className="mt-3 space-y-2">
            {PLANNED_MODES.map((mode) => (
              <div
                key={mode.name}
                className="flex items-center justify-between rounded-md border border-dashed border-border px-3 py-2 text-xs opacity-60"
              >
                <span className="font-medium">{mode.name}</span>
                <span className="text-muted-foreground">{mode.note}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
