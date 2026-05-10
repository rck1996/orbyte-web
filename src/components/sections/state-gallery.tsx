import { AlertTriangle, CircleCheckBig, Inbox } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import type { ExperienceState } from "@/types/dashboard";

const stateConfig = {
  empty: {
    icon: Inbox,
    badge: "Setup ready",
    tone: "neutral" as const,
  },
  success: {
    icon: CircleCheckBig,
    badge: "Completed",
    tone: "success" as const,
  },
  error: {
    icon: AlertTriangle,
    badge: "Needs action",
    tone: "danger" as const,
  },
};

export function StateGallery({ states }: { states: ExperienceState[] }) {
  return (
    <section className="grid gap-24">
      <Reveal>
        <SectionHeading
          badge="UX states"
          title="Empty, success, and error experiences are first-class UI surfaces."
          description="These patterns are intentionally visible in the dashboard so product teams can design state transitions with the same quality as the default screen."
        />
      </Reveal>

      <div className="grid gap-16 lg:grid-cols-3">
        {states.map((state, index) => {
          const config = stateConfig[state.tone];
          const Icon = config.icon;

          return (
            <Reveal key={state.title} delay={0.06 * index}>
              <Card className="grid gap-16">
                <div className="flex size-48 items-center justify-center rounded-2xl bg-white/6">
                  <Icon className="size-24 text-foreground" aria-hidden="true" />
                </div>
                <div className="grid gap-8">
                  <Badge tone={config.tone} className="w-fit">
                    {config.badge}
                  </Badge>
                  <h3 className="text-lg font-medium text-foreground sm:text-xl">{state.title}</h3>
                  <p className="text-sm leading-[1.6] text-muted-strong">
                    {state.description}
                  </p>
                </div>
              </Card>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
