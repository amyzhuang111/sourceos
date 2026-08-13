import Link from "next/link";
import { CircleDot } from "lucide-react";

export function Topbar() {
  const llmConfigured = !!process.env.ANTHROPIC_API_KEY;

  return (
    <header className="flex h-14 shrink-0 items-center justify-end gap-3 border-b border-border bg-background px-4">
      <Link
        href="/settings"
        className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-[11px] font-medium hover:bg-muted"
      >
        <CircleDot
          className={`size-3 ${llmConfigured ? "text-emerald-500" : "text-amber-500"}`}
        />
        {llmConfigured ? "Anthropic connected" : "LLM not configured"}
      </Link>
    </header>
  );
}
