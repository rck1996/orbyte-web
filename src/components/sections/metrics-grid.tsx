"use client";

import { motion, useReducedMotion } from "framer-motion";

import { Reveal } from "@/components/motion/reveal";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { motionTransition } from "@/design-system/tokens";
import type { Metric } from "@/types/dashboard";

const toneClasses: Record<Metric["tone"], string> = {
  accent: "text-accent",
  success: "text-success",
  warning: "text-warning",
};

export function MetricsGrid({ metrics }: { metrics: Metric[] }) {
  const reducedMotion = useReducedMotion();

  return (
    <section className="grid gap-24">
      <Reveal>
        <SectionHeading
          badge="Performance"
          title="A fast scan of the numbers that actually move the business."
          description="Each card is designed for fast executive reading: one headline number, one directional signal, one line of context."
        />
      </Reveal>

      <div className="grid gap-16 lg:grid-cols-3">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={reducedMotion ? undefined : { ...motionTransition, delay: 0.06 * index }}
            whileHover={reducedMotion ? undefined : { y: -2 }}
            whileTap={reducedMotion ? undefined : { scale: 0.98 }}
          >
            <Card className="grid gap-16">
              <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted">{metric.label}</p>
                <span className={`text-sm ${toneClasses[metric.tone]}`}>{metric.delta}</span>
              </div>
              <p className="text-3xl leading-none font-semibold tracking-[-0.05em] text-foreground sm:text-4xl md:text-5xl">
                {metric.value}
              </p>
              <p className="text-sm leading-[1.6] text-muted-strong">{metric.detail}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
