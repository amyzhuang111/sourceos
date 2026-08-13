"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Radar,
  Building2,
  Compass,
  Users,
  MessagesSquare,
  Target,
  ThumbsUp,
  ListChecks,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Priority Feed", icon: Radar },
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/people", label: "People", icon: Users },
  { href: "/mentions", label: "Mentions", icon: MessagesSquare },
  { href: "/thesis", label: "Thesis", icon: Target },
  { href: "/feedback", label: "Feedback", icon: ThumbsUp },
  { href: "/runs", label: "Runs", icon: ListChecks },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex size-6 items-center justify-center rounded bg-primary text-primary-foreground">
          <Radar className="size-3.5" strokeWidth={2.5} />
        </div>
        <div className="leading-tight">
          <div className="text-[13px] font-semibold tracking-tight">SourceOS</div>
          <div className="text-[10px] text-muted-foreground -mt-0.5">Sourcing OS</div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border px-3 py-3 text-[11px] text-muted-foreground">
        Single-investor tool. All scoring is opinionated, not objective truth.
      </div>
    </aside>
  );
}
