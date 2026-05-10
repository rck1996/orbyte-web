import { CheckCircle2, Radio } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import type { ActivityItem, HealthItem } from "@/types/dashboard";

const statusTone: Record<ActivityItem["status"], "accent" | "success" | "warning"> = {
  Live: "accent",
  Resolved: "success",
  Review: "warning",
};

export function OperationsPanel({
  activity,
  health,
}: {
  activity: ActivityItem[];
  health: HealthItem[];
}) {
  return (
    <section className="grid gap-24">
      <Reveal>
        <SectionHeading
          badge="Operations"
          title="Incident context and system confidence stay visible without stealing attention."
          description="The layout keeps the active stream on the left and the confidence model on the right, which lowers scan time on desktop and stacks cleanly on mobile."
        />
      </Reveal>

      <div className="grid gap-16 xl:grid-cols-[1.1fr_0.9fr]">
        <Reveal delay={0.05}>
          <Card className="grid gap-16">
            <div className="flex flex-col items-start gap-12 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-12">
                <Radio className="size-16 text-accent" aria-hidden="true" />
                <h3 className="text-lg font-medium text-foreground">Live activity</h3>
              </div>
              <Badge tone="accent">Streaming</Badge>
            </div>
            <div className="grid gap-12">
              {activity.map((item) => (
                <article
                  key={item.title}
                  className="rounded-[24px] border border-border/80 bg-surface-soft p-16"
                >
                  <div className="flex flex-wrap items-center gap-12">
                    <Badge tone={statusTone[item.status]}>{item.status}</Badge>
                    <span className="text-sm text-muted">{item.timestamp}</span>
                  </div>
                  <h4 className="mt-12 text-base font-medium text-foreground sm:text-lg">
                    {item.title}
                  </h4>
                  <p className="mt-8 text-sm leading-[1.6] text-muted-strong">
                    {item.summary}
                  </p>
                </article>
              ))}
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.1}>
          <Card className="grid gap-16">
            <div className="flex items-center gap-12">
              <CheckCircle2 className="size-16 text-success" aria-hidden="true" />
              <h3 className="text-lg font-medium text-foreground">Health index</h3>
            </div>
            <div className="grid gap-16">
              {health.map((item) => (
                <div key={item.label} className="grid gap-12 rounded-[24px] bg-surface-soft p-16">
                  <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted">{item.label}</p>
                    <span className="text-sm text-foreground">{item.value}</span>
                  </div>
                  <div
                    aria-hidden="true"
                    className="h-8 overflow-hidden rounded-full bg-white/8"
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent to-success"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}
