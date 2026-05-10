import { Activity, BellRing, Bot, Sparkles } from "lucide-react";

import type { DashboardData } from "@/types/dashboard";

export const dashboardData: DashboardData = {
  highlights: [
    { label: "Live customers", value: "18.4k" },
    { label: "Pipeline health", value: "99.982%" },
    { label: "Automations active", value: "142" },
  ],
  metrics: [
    {
      label: "Net revenue retention",
      value: "128.4%",
      delta: "+6.8%",
      detail: "Driven by enterprise expansion in the last 30 days.",
      tone: "accent",
    },
    {
      label: "Automation throughput",
      value: "3.2M",
      delta: "+12.1%",
      detail: "Events processed across onboarding, billing, and routing.",
      tone: "success",
    },
    {
      label: "Risk exposure",
      value: "0.14%",
      delta: "-0.03%",
      detail: "Stabilized by proactive rollback and policy guardrails.",
      tone: "warning",
    },
  ],
  activity: [
    {
      title: "Latency anomaly isolated in edge worker cluster",
      timestamp: "2 minutes ago",
      summary: "Traffic shifted automatically and checkout paths remained within target SLA.",
      status: "Resolved",
    },
    {
      title: "Lifecycle campaign crossed conversion target",
      timestamp: "18 minutes ago",
      summary: "The new onboarding sequence lifted paid activation for EU teams.",
      status: "Live",
    },
    {
      title: "Security policy update awaiting approval",
      timestamp: "46 minutes ago",
      summary: "Three admin scopes were narrowed before global rollout.",
      status: "Review",
    },
  ],
  health: [
    { label: "Data freshness", value: "11 sec", progress: 86 },
    { label: "Infrastructure resilience", value: "99.98%", progress: 94 },
    { label: "Forecast confidence", value: "91%", progress: 78 },
  ],
  automations: [
    {
      title: "Revenue command",
      description: "Monitors expansion signals and routes high-intent accounts to sales instantly.",
      icon: "chart",
    },
    {
      title: "Ops intelligence",
      description: "Correlates releases, incidents, and support patterns before they become churn.",
      icon: "orbit",
    },
    {
      title: "Trust fabric",
      description: "Scans permissions drift and surfaces human approval only when needed.",
      icon: "shield",
    },
    {
      title: "Data pulse",
      description: "Keeps warehouse sync healthy with automated replay and lineage tracking.",
      icon: "database",
    },
  ],
  releases: [
    { title: "Adaptive billing alerts", stage: "Canary", owner: "Payments" },
    { title: "Guided analyst workspace", stage: "QA", owner: "Product" },
    { title: "Smart account segmentation", stage: "Ready", owner: "Growth" },
  ],
  states: [
    {
      title: "Empty state",
      description: "New workspaces start with recommended automations and a guided setup path.",
      tone: "empty",
    },
    {
      title: "Success state",
      description: "Critical jobs close with direct confirmation, next actions, and impacted scope.",
      tone: "success",
    },
    {
      title: "Error state",
      description: "Failures expose status, context, and a recovery action without overwhelming the user.",
      tone: "error",
    },
  ],
};

export const shellNavigation = [
  { label: "Overview", icon: Sparkles },
  { label: "Signals", icon: Activity },
  { label: "Automations", icon: Bot },
  { label: "Alerts", icon: BellRing },
];
