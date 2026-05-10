import {
  ArrowRight,
  ChartNoAxesCombined,
  DatabaseZap,
  Orbit,
  ShieldCheck,
} from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Automation, Release } from "@/types/dashboard";

const automationIcons = {
  chart: ChartNoAxesCombined,
  orbit: Orbit,
  shield: ShieldCheck,
  database: DatabaseZap,
};

export function PipelineSection({
  automations,
  releases,
}: {
  automations: Automation[];
  releases: Release[];
}) {
  return (
    <section className="grid gap-24">
      <Reveal>
        <SectionHeading
          badge="Execution"
          title="Automation modules and release readiness sit in the same visual rhythm."
          description="This keeps operational decisions close to shipping decisions, which is usually where SaaS teams lose context."
        />
      </Reveal>

      <Reveal delay={0.06}>
        <Card className="grid gap-16">
          <div className="flex flex-col items-start gap-12 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-medium text-foreground">Automation stack</h3>
            <Badge tone="accent">4 active</Badge>
          </div>
          <div className="grid gap-12">
            {automations.map(({ title, description, icon }) => {
              const Icon = automationIcons[icon];

              return (
              <div
                key={title}
                className="rounded-[24px] border border-border/80 bg-surface-soft p-16"
              >
                <div className="flex items-start gap-12">
                  <div className="mt-4 flex size-48 shrink-0 items-center justify-center rounded-2xl bg-white/6 sm:mt-0">
                    <Icon className="size-16 text-accent" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="text-base font-medium text-foreground">{title}</h4>
                    <p className="mt-4 text-sm leading-[1.6] text-muted-strong">
                      {description}
                    </p>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </Card>
      </Reveal>

      <Reveal delay={0.1}>
        <Card className="grid gap-16">
          <div className="flex flex-col items-start gap-12 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-medium text-foreground">Release board</h3>
            <Button variant="ghost" size="sm">
              View roadmap
              <ArrowRight className="size-16" aria-hidden="true" />
            </Button>
          </div>
          <div className="grid gap-12">
            {releases.map((release) => (
              <div
                key={release.title}
                className="flex flex-col items-start gap-12 rounded-[24px] border border-border/80 bg-surface-soft p-16 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h4 className="text-base font-medium text-foreground">
                    {release.title}
                  </h4>
                  <p className="mt-4 text-sm text-muted-strong">{release.owner}</p>
                </div>
                <Badge>{release.stage}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </Reveal>
    </section>
  );
}
