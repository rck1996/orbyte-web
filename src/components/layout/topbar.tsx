import { Bell, Command, Search, Sparkles } from "lucide-react";

import { shellNavigation } from "@/config/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function Topbar() {
  return (
    <header className="surface-panel sticky top-0 z-30 grid gap-16 rounded-[24px] border border-border/80 px-16 py-12 md:px-24">
      <div className="flex flex-col items-start gap-16 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-12">
          <div className="flex size-48 shrink-0 items-center justify-center rounded-full border border-border bg-surface-soft text-muted-strong xl:hidden">
            <Command className="size-16" aria-hidden="true" />
          </div>
        <div className="min-w-0">
          <p className="hidden text-sm text-muted sm:block">Saturday, May 9, 2026</p>
          <div className="flex flex-wrap items-center gap-8">
            <h1 className="text-base font-medium text-foreground sm:text-lg md:text-xl">
              Operations command center
            </h1>
            <Badge tone="accent">Realtime</Badge>
          </div>
        </div>
        </div>

        <div className="flex w-full items-center justify-between gap-8 md:w-auto md:justify-end">
          <div className="flex items-center gap-8">
            <Button variant="ghost" size="sm" aria-label="Search">
              <Search className="size-16" aria-hidden="true" />
            </Button>
            <Button variant="ghost" size="sm" aria-label="Notifications">
              <Bell className="size-16" aria-hidden="true" />
            </Button>
          </div>
          <Button variant="secondary" size="sm" className="shrink-0">
            <Sparkles className="size-16" aria-hidden="true" />
            <span className="hidden sm:inline">Deploy insight</span>
            <span className="sm:hidden">Deploy</span>
          </Button>
        </div>
      </div>

      <nav
        aria-label="Mobile sections"
        className="flex gap-8 overflow-x-auto pb-4 xl:hidden"
      >
        {shellNavigation.map(({ label, icon: Icon }, index) => (
          <button
            key={label}
            type="button"
            className="flex shrink-0 items-center gap-8 rounded-full border border-border bg-surface-soft px-12 py-8 text-sm text-muted-strong transition hover:bg-surface-strong hover:text-foreground"
          >
            <Icon className="size-16" aria-hidden="true" />
            <span>{label}</span>
            {index === 0 ? <Badge className="ml-4">Live</Badge> : null}
          </button>
        ))}
      </nav>
    </header>
  );
}
