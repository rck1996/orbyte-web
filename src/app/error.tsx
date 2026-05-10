"use client";

import { RefreshCw } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <AppShell>
      <section className="surface-card flex min-h-[60vh] flex-col items-start justify-center gap-24 rounded-[32px] border border-danger/20 p-24 md:p-32">
        <div className="inline-flex items-center gap-8 rounded-full border border-danger/25 bg-danger/10 px-12 py-8 text-sm text-danger">
          System incident
        </div>
        <div className="grid max-w-2xl gap-12">
          <h1 className="text-balance text-4xl leading-[1.02] font-semibold tracking-[-0.04em] text-foreground md:text-6xl">
            The Orbyte command layer hit an unexpected fault.
          </h1>
          <p className="max-w-xl text-base leading-[1.65] text-muted-strong md:text-lg md:leading-[1.7]">
            The dashboard failed to render. Retry the route to restore the live
            operational surface.
          </p>
        </div>
        <Button onClick={reset}>
          <RefreshCw className="size-16" aria-hidden="true" />
          Retry render
        </Button>
      </section>
    </AppShell>
  );
}
