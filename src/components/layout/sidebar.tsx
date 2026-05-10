import { Command, Search } from "lucide-react";

import { shellNavigation } from "@/config/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  return (
    <aside className="surface-panel sticky top-24 hidden h-[calc(100vh-48px)] min-w-[280px] flex-col rounded-[32px] border border-border/80 p-24 xl:flex">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-12">
          <div className="flex size-48 items-center justify-center rounded-2xl bg-foreground text-background">
            <Command className="size-24" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm text-muted">Workspace</p>
            <p className="text-base font-medium text-foreground">Orbyte</p>
          </div>
        </div>
        <Badge>v1.0</Badge>
      </div>

      <nav aria-label="Primary" className="mt-32 grid gap-8">
        {shellNavigation.map(({ label, icon: Icon }, index) => (
          <button
            key={label}
            className="flex items-center gap-12 rounded-2xl px-16 py-12 text-left text-sm text-muted-strong transition hover:bg-surface-soft hover:text-foreground focus-visible:bg-surface-soft"
            type="button"
          >
            <Icon className="size-16" aria-hidden="true" />
            <span>{label}</span>
            {index === 0 ? <Badge className="ml-auto">Live</Badge> : null}
          </button>
        ))}
      </nav>

      <div className="mt-auto grid gap-16 rounded-[32px] border border-border/80 bg-surface-soft p-24">
        <div className="flex items-center gap-12">
          <div className="flex size-48 items-center justify-center rounded-full bg-white/8">
            <Search className="size-16 text-accent" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Quick command</p>
            <p className="text-sm text-muted">Search insights and automations.</p>
          </div>
        </div>
        <Button variant="secondary">Open palette</Button>
      </div>
    </aside>
  );
}
