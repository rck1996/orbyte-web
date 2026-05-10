import type { UniverseData } from "@/types/universe";

export const universeData: UniverseData = {
  title: "Orbyte Universe",
  summary:
    "A cinematic productivity cosmos where galaxies hold strategic domains, solar systems hold objectives, and planets carry the work that moves them forward.",
  stats: {
    completion: "74%",
    focus: "6 live objectives",
    liveSystems: "3 galaxies",
  },
  galaxies: [
    {
      id: "galaxy-orbit",
      name: "Orbit",
      category: "Execution",
      color: "#7dd3fc",
      accent: "#e0f2fe",
      progress: 72,
      description:
        "Delivery systems, launch readiness, and coordination rhythms for work that is already moving.",
      position: [-14, 2, -8],
      objectives: [
        {
          id: "obj-release",
          name: "Release cadence",
          description: "Stabilize launches and reduce friction between design, engineering, and ops.",
          orbitRadius: 4.2,
          progress: 78,
          tasks: [
            {
              id: "task-sprint",
              name: "Sprint launch",
              state: "in_progress",
              progress: 68,
              dueDate: "May 14",
              summary: "Coordinate design QA, rollout notes, and production verification.",
              subtasks: [
                {
                  id: "sub-handoff",
                  name: "Design handoff",
                  progress: 90,
                  dueDate: "May 10",
                  metadata: "UI package and motion review ready",
                },
                {
                  id: "sub-qa",
                  name: "QA sweep",
                  progress: 54,
                  dueDate: "May 12",
                  metadata: "Regression pass across release surfaces",
                },
              ],
            },
            {
              id: "task-docs",
              name: "Launch notes",
              state: "todo",
              progress: 22,
              dueDate: "May 15",
              summary: "Prepare internal release narrative and external update digest.",
              subtasks: [
                {
                  id: "sub-changelog",
                  name: "Changelog",
                  progress: 36,
                  dueDate: "May 11",
                  metadata: "Waiting on final owner approvals",
                },
              ],
            },
          ],
        },
        {
          id: "obj-systems",
          name: "Ops routing",
          description: "Keep work distribution and system alerts calm under load.",
          orbitRadius: 6.6,
          progress: 63,
          tasks: [
            {
              id: "task-alerts",
              name: "Alert triage",
              state: "done",
              progress: 100,
              dueDate: "Completed",
              summary: "Escalation paths now prioritize impact and suppress low-signal noise.",
              subtasks: [
                {
                  id: "sub-policy",
                  name: "Routing policy",
                  progress: 100,
                  dueDate: "Closed",
                  metadata: "Policy shipped globally",
                },
              ],
            },
            {
              id: "task-capacity",
              name: "Capacity map",
              state: "in_progress",
              progress: 57,
              dueDate: "May 18",
              summary: "Align people availability with peak execution windows.",
              subtasks: [
                {
                  id: "sub-zones",
                  name: "Time zone model",
                  progress: 62,
                  dueDate: "May 13",
                  metadata: "Coverage gaps under review",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "galaxy-pulse",
      name: "Pulse",
      category: "Growth",
      color: "#a78bfa",
      accent: "#f3e8ff",
      progress: 81,
      description:
        "Acquisition, activation, and lifecycle systems powering the next wave of expansion.",
      position: [0, -1, 0],
      objectives: [
        {
          id: "obj-activation",
          name: "Activation arc",
          description: "Guide new teams from arrival to first value with lower cognitive load.",
          orbitRadius: 4.8,
          progress: 84,
          tasks: [
            {
              id: "task-onboarding",
              name: "Onboarding path",
              state: "in_progress",
              progress: 76,
              dueDate: "May 16",
              summary: "Sequence the first-session prompts, guidance panels, and setup checklist.",
              subtasks: [
                {
                  id: "sub-checklist",
                  name: "Checklist logic",
                  progress: 88,
                  dueDate: "May 12",
                  metadata: "Edge cases mapped for enterprise workspaces",
                },
                {
                  id: "sub-copy",
                  name: "Guidance copy",
                  progress: 71,
                  dueDate: "May 13",
                  metadata: "Tone pass pending",
                },
              ],
            },
            {
              id: "task-insights",
              name: "Value moments",
              state: "done",
              progress: 100,
              dueDate: "Completed",
              summary: "Instrumentation now tracks the first meaningful signals across teams.",
              subtasks: [
                {
                  id: "sub-instrumentation",
                  name: "Signal events",
                  progress: 100,
                  dueDate: "Closed",
                  metadata: "Tracking deployed",
                },
              ],
            },
          ],
        },
        {
          id: "obj-retention",
          name: "Retention field",
          description: "Spot risk, identify expansion intent, and keep the account universe healthy.",
          orbitRadius: 7.4,
          progress: 69,
          tasks: [
            {
              id: "task-health",
              name: "Health score",
              state: "todo",
              progress: 31,
              dueDate: "May 20",
              summary: "Unify behavioral, revenue, and support patterns into one index.",
              subtasks: [
                {
                  id: "sub-model",
                  name: "Score model",
                  progress: 34,
                  dueDate: "May 15",
                  metadata: "Awaiting data QA signoff",
                },
              ],
            },
            {
              id: "task-renewals",
              name: "Renewal signals",
              state: "blocked",
              progress: 42,
              dueDate: "Blocked",
              summary: "Prediction layer is waiting on upstream billing normalization.",
              subtasks: [
                {
                  id: "sub-billing",
                  name: "Billing sync",
                  progress: 40,
                  dueDate: "Unknown",
                  metadata: "Source contract mismatch",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "galaxy-nova",
      name: "Nova",
      category: "Strategy",
      color: "#34d399",
      accent: "#ecfdf5",
      progress: 64,
      description:
        "Long-horizon bets, platform intelligence, and structural work that shapes the next cycle.",
      position: [15, 4, -10],
      objectives: [
        {
          id: "obj-platform",
          name: "Platform horizon",
          description: "Make the system more composable while keeping the product calm and legible.",
          orbitRadius: 5.2,
          progress: 58,
          tasks: [
            {
              id: "task-data-layer",
              name: "Data layer",
              state: "in_progress",
              progress: 61,
              dueDate: "May 22",
              summary: "Abstract analytics and workflow data into one predictable service surface.",
              subtasks: [
                {
                  id: "sub-schema",
                  name: "Schema design",
                  progress: 70,
                  dueDate: "May 14",
                  metadata: "Versioned contracts drafted",
                },
                {
                  id: "sub-adapters",
                  name: "Service adapters",
                  progress: 48,
                  dueDate: "May 17",
                  metadata: "CRM and billing bridge in progress",
                },
              ],
            },
          ],
        },
        {
          id: "obj-research",
          name: "Research nebula",
          description: "Validate new product directions before they become commitments.",
          orbitRadius: 8,
          progress: 71,
          tasks: [
            {
              id: "task-concepts",
              name: "Concept probes",
              state: "done",
              progress: 100,
              dueDate: "Completed",
              summary: "Three premium workflow concepts tested with target teams.",
              subtasks: [
                {
                  id: "sub-interviews",
                  name: "Interviews",
                  progress: 100,
                  dueDate: "Closed",
                  metadata: "12 sessions synthesized",
                },
              ],
            },
            {
              id: "task-roadmap",
              name: "Roadmap lens",
              state: "todo",
              progress: 19,
              dueDate: "May 28",
              summary: "Translate validated opportunities into sequence-aware bets.",
              subtasks: [
                {
                  id: "sub-sizing",
                  name: "Sizing model",
                  progress: 28,
                  dueDate: "May 19",
                  metadata: "Need dependency mapping",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
