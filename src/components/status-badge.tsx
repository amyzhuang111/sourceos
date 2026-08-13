import { cn } from "@/lib/utils";

type StatusTone = "green" | "amber" | "red" | "blue" | "neutral";

const STATUS_TONE_MAP: Record<string, StatusTone> = {
  // Company status
  NEW: "blue",
  RESEARCHING: "amber",
  REVIEW: "amber",
  HIGH: "green",
  MEDIUM: "blue",
  LOW: "neutral",
  PASS: "red",
  CONTACTED: "blue",
  MEETING: "blue",
  TRACKING: "amber",
  ARCHIVED: "neutral",
  // Decision
  CONTACT: "blue",
  MEET: "blue",
  TRACK: "amber",
  // AgentRun
  QUEUED: "neutral",
  RUNNING: "amber",
  SUCCEEDED: "green",
  FAILED: "red",
  PARTIAL: "amber",
  // TasteProposal / SourceProposal
  PENDING: "amber",
  ACCEPTED: "green",
  REJECTED: "red",
};

const TONE_CLASSES: Record<StatusTone, string> = {
  green:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900",
  amber:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900",
  red: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900",
  blue: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900",
  neutral: "bg-muted text-muted-foreground border-border",
};

export function statusTone(status: string): StatusTone {
  return STATUS_TONE_MAP[status] ?? "neutral";
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const tone = statusTone(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        TONE_CLASSES[tone],
        className
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          tone === "green" && "bg-emerald-500",
          tone === "amber" && "bg-amber-500",
          tone === "red" && "bg-red-500",
          tone === "blue" && "bg-blue-500",
          tone === "neutral" && "bg-muted-foreground"
        )}
      />
      {status}
    </span>
  );
}
