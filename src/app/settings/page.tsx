import { CircleDot } from "lucide-react";
import { PageHeader } from "@/components/page-header";

function ProviderRow({
  name,
  envVar,
  configured,
  description,
}: {
  name: string;
  envVar: string;
  configured: boolean;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-3">
      <div>
        <div className="flex items-center gap-2">
          <CircleDot className={`size-3 ${configured ? "text-emerald-500" : "text-amber-500"}`} />
          <span className="text-sm font-medium">{name}</span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="text-right">
        <div className={`text-xs font-medium ${configured ? "text-emerald-600" : "text-amber-600"}`}>
          {configured ? "Configured" : "Not configured"}
        </div>
        <div className="font-mono text-[11px] text-muted-foreground">{envVar}</div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const anthropicConfigured = !!process.env.ANTHROPIC_API_KEY;
  const exaConfigured = !!process.env.EXA_API_KEY;

  return (
    <div className="pb-10">
      <PageHeader title="Settings" subtitle="Providers, sources, and automation." />

      <section className="mt-5 space-y-4 px-6">
        <div>
          <h2 className="mb-2 text-sm font-semibold">Providers</h2>
          <div className="space-y-2">
            <ProviderRow
              name="Anthropic (LLM)"
              envVar="ANTHROPIC_API_KEY"
              configured={anthropicConfigured}
              description="Powers the company-analyst and thesis-matcher agents. Required for Run research to work; without it the app still boots, that feature just returns a clear error."
            />
            <ProviderRow
              name="Exa (web search)"
              envVar="EXA_API_KEY"
              configured={exaConfigured}
              description="Optional. Not yet wired into any agent this session — the adapter exists (src/lib/providers/search/exa.ts) but Scout / autonomous discovery isn't built yet."
            />
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-sm font-semibold">Sources</h2>
          <div className="rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground">
            The source registry (config/sources.yaml), per-source performance tracking, and the
            /settings/sources table described in CLAUDE.md are not implemented in this session.
            The only working discovery path today is manual URL import on the{" "}
            <a href="/discover" className="text-foreground hover:underline">
              Discover
            </a>{" "}
            page.
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-sm font-semibold">Automation</h2>
          <div className="rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground">
            Cron-compatible scripts (source:daily, monitor:daily, brief:daily, reflect:weekly) are
            not implemented in this session. Research runs today only from the UI, on demand.
          </div>
        </div>
      </section>
    </div>
  );
}
