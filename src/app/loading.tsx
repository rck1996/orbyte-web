import { AppShell } from "@/components/layout/app-shell";

export default function Loading() {
  return (
    <AppShell>
      <section
        aria-label="Loading dashboard"
        className="grid gap-24"
      >
        <div className="surface-card grid gap-24 rounded-[32px] border border-border/80 p-24 md:p-32">
          <div className="h-12 w-32 animate-pulse rounded-full bg-surface-soft" />
          <div className="grid gap-12">
            <div className="h-48 max-w-3xl animate-pulse rounded-[32px] bg-surface-soft" />
            <div className="h-24 max-w-2xl animate-pulse rounded-[24px] bg-surface-soft" />
          </div>
          <div className="grid gap-16 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-128 animate-pulse rounded-[32px] bg-surface-soft"
              />
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
