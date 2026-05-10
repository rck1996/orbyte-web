import { ArrowUpRight, Play } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Highlight, Metric } from "@/types/dashboard";

export function HeroSection({
  highlights,
  metrics,
}: {
  highlights: Highlight[];
  metrics: Metric[];
}) {
  return (
    <section className="grid gap-24 xl:grid-cols-[1.2fr_0.8fr]">
      <Reveal>
        <Card className="relative overflow-hidden p-16 md:p-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(125,211,252,0.22),transparent_30%)]" />
          <div className="relative grid gap-32">
            <div className="flex flex-wrap items-center gap-12">
              <Badge tone="accent">Orbyte control plane</Badge>
              <Badge>Q2 momentum</Badge>
            </div>

            <div className="grid gap-12 md:gap-16">
              <h2 className="max-w-4xl text-balance text-3xl leading-[0.96] font-semibold tracking-[-0.06em] text-foreground sm:text-5xl md:text-6xl xl:text-7xl">
                Coordinate revenue, product, and reliability from one cinematic dashboard.
              </h2>
              <p className="max-w-2xl text-sm leading-[1.65] text-muted-strong sm:text-base sm:leading-[1.65] md:text-lg md:leading-[1.7]">
                Orbyte gives operating teams a refined command surface for live metrics,
                launch health, risk visibility, and action-ready automation.
              </p>
            </div>

            <div className="grid gap-12 sm:flex sm:flex-wrap">
              <Button className="w-full sm:w-auto">
                Launch workspace
                <ArrowUpRight className="size-16" aria-hidden="true" />
              </Button>
              <Button variant="secondary" className="w-full sm:w-auto">
                <Play className="size-16" aria-hidden="true" />
                Watch walkthrough
              </Button>
            </div>

            <div className="grid gap-12 md:grid-cols-3 md:gap-16">
              {highlights.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[24px] border border-border/80 bg-surface-soft p-16"
                >
                  <p className="text-sm text-muted">{item.label}</p>
                  <p className="mt-8 text-2xl leading-none font-semibold tracking-[-0.04em] text-foreground">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </Reveal>

      <Reveal delay={0.08}>
        <Card className="grid gap-16 p-16 md:gap-24 md:p-32">
          <div className="flex flex-col items-start gap-12 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted">Forecast mode</p>
              <p className="text-lg font-medium text-foreground">Executive snapshot</p>
            </div>
            <Badge tone="success">Stable</Badge>
          </div>

          <div className="grid gap-16">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-[24px] border border-border/80 bg-surface-soft p-16"
              >
                <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted">{metric.label}</p>
                  <span className="text-sm text-accent">{metric.delta}</span>
                </div>
                <p className="mt-12 text-2xl leading-none font-semibold tracking-[-0.05em] text-foreground sm:text-3xl">
                  {metric.value}
                </p>
                <p className="mt-8 text-sm leading-[1.6] text-muted-strong">
                  {metric.detail}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </Reveal>
    </section>
  );
}
