import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { getActiveThesis, listThesisHistory } from "@/lib/thesis/thesis";
import { SCORE_DIMENSION_KEYS } from "@/lib/scoring/priority";
import { updateThesisAction } from "./actions";

const STAGES = ["PRE_SEED", "SEED", "SERIES_A", "SERIES_B", "SERIES_C_PLUS", "GROWTH"];

const DIMENSION_LABELS: Record<string, string> = {
  thesisFit: "Thesis fit",
  founderQuality: "Founder quality",
  technicalDepth: "Technical depth",
  marketPotential: "Market potential",
  timing: "Timing",
  traction: "Traction",
  differentiation: "Differentiation",
  distributionPotential: "Distribution potential",
  personalInterest: "Personal interest",
};

export default async function ThesisPage() {
  const thesis = await getActiveThesis();
  const history = await listThesisHistory();

  const sectors = ((thesis?.sectors as string[]) ?? []).join("\n");
  const preferredStages = (thesis?.preferredStages as string[]) ?? [];
  const positiveSignals = ((thesis?.positiveSignals as string[]) ?? []).join("\n");
  const negativeSignals = ((thesis?.negativeSignals as string[]) ?? []).join("\n");
  const hardExclusions = ((thesis?.hardExclusions as string[]) ?? []).join("\n");
  const weights = (thesis?.weights as Record<string, number>) ?? {};

  return (
    <div className="pb-10">
      <PageHeader
        title="Thesis"
        subtitle={`Active thesis v${thesis?.version ?? 0} — these are starting defaults, not permanent truth.`}
      />

      <section className="mt-5 grid grid-cols-5 gap-6 px-6">
        <form action={updateThesisAction} className="col-span-3 space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={thesis?.name} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={thesis?.description ?? ""} className="min-h-16" />
          </div>
          <div className="space-y-1">
            <Label>Preferred stages</Label>
            <div className="flex flex-wrap gap-3 rounded-md border border-border p-2.5">
              {STAGES.map((stage) => (
                <label key={stage} className="flex items-center gap-1.5 text-xs">
                  <Checkbox
                    name="preferredStages"
                    value={stage}
                    defaultChecked={preferredStages.includes(stage)}
                  />
                  {stage.replace("_", "-")}
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="sectors">Sectors (one per line)</Label>
            <Textarea id="sectors" name="sectors" defaultValue={sectors} className="min-h-24 font-mono text-xs" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="positiveSignals">Positive signals (one per line)</Label>
              <Textarea
                id="positiveSignals"
                name="positiveSignals"
                defaultValue={positiveSignals}
                className="min-h-32 font-mono text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="negativeSignals">Negative signals (one per line)</Label>
              <Textarea
                id="negativeSignals"
                name="negativeSignals"
                defaultValue={negativeSignals}
                className="min-h-32 font-mono text-xs"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="hardExclusions">Hard exclusions (one per line)</Label>
            <Textarea
              id="hardExclusions"
              name="hardExclusions"
              defaultValue={hardExclusions}
              className="min-h-16 font-mono text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label>Dimension weights</Label>
            <p className="text-[11px] text-muted-foreground">
              Normalized automatically — they don&apos;t need to sum to 1.
            </p>
            <div className="grid grid-cols-3 gap-2 rounded-md border border-border p-2.5">
              {SCORE_DIMENSION_KEYS.map((key) => (
                <div key={key} className="space-y-0.5">
                  <Label htmlFor={`weight_${key}`} className="text-[11px] font-normal text-muted-foreground">
                    {DIMENSION_LABELS[key]}
                  </Label>
                  <Input
                    id={`weight_${key}`}
                    name={`weight_${key}`}
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    defaultValue={weights[key] ?? ""}
                    className="h-7 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          <Button type="submit">Save as new version</Button>
        </form>

        <div className="col-span-2">
          <h2 className="mb-2 text-sm font-semibold">Version history</h2>
          <div className="space-y-2">
            {history.map((t) => (
              <div key={t.id} className="rounded-lg border border-border p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">v{t.version}</span>
                  {t.active && <Badge className="text-[10px]">active</Badge>}
                </div>
                <div className="mt-0.5 text-xs">{t.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  {t.updatedAt.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
