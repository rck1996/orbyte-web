import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type {
  DomainCategory,
  DomainObjective,
  DomainSubtask,
  DomainTask,
  Habit,
  HabitCadence,
  TaskState,
  WorkspaceDomain,
} from "@/types/domain";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const DATA_FILE = path.join(DATA_DIR, "universe-db.json");
const IS_VERCEL_RUNTIME = Boolean(process.env.VERCEL);

let memoryWorkspace: WorkspaceDomain | null = null;

const galaxyProfiles = [
  {
    id: "galaxy-orbit",
    name: "Orbit",
    category: "Execution",
    color: "#7dd3fc",
    accent: "#e0f2fe",
    description: "Delivery, launches, and operating rhythms for work already in motion.",
    position: [-16, 2, -10] as [number, number, number],
    objectiveSeeds: [
      ["Release cadence", "make launches calm and predictable", "release readiness"],
      ["Ops routing", "keep work distribution and alerts stable under load", "ops review"],
      ["QA lattice", "reduce regressions before release windows", "qa pass"],
      ["Service handoff", "sharpen ownership at delivery boundaries", "handoff review"],
      ["Runbook mesh", "keep the team resilient during incidents", "runbook drill"],
    ],
  },
  {
    id: "galaxy-pulse",
    name: "Pulse",
    category: "Growth",
    color: "#a78bfa",
    accent: "#f3e8ff",
    description: "Acquisition, activation, and expansion loops that feed sustainable growth.",
    position: [-6, -2, -3] as [number, number, number],
    objectiveSeeds: [
      ["Activation arc", "guide new teams to first value faster", "activation review"],
      ["Retention field", "spot churn risk earlier and respond with precision", "account check-in"],
      ["Expansion beacon", "surface upgrade intent from product behavior", "upsell notes"],
      ["Referral current", "turn delighted teams into repeat advocates", "referral ask"],
      ["Lifecycle engine", "coordinate messaging across the customer journey", "lifecycle cleanup"],
    ],
  },
  {
    id: "galaxy-nova",
    name: "Nova",
    category: "Strategy",
    color: "#34d399",
    accent: "#ecfdf5",
    description: "Long-horizon bets, research, and structural work shaping the next cycle.",
    position: [6, 3, -8] as [number, number, number],
    objectiveSeeds: [
      ["Platform horizon", "make the system more composable without adding noise", "platform notes"],
      ["Research nebula", "validate new product directions before commitment", "research synthesis"],
      ["Scenario deck", "prepare strategic responses to likely market shifts", "scenario refresh"],
      ["Capability map", "identify missing strengths for the next phase", "capability review"],
      ["Roadmap lens", "sequence long-range bets with clearer evidence", "roadmap check"],
    ],
  },
  {
    id: "galaxy-atlas",
    name: "Atlas",
    category: "Infrastructure",
    color: "#60a5fa",
    accent: "#dbeafe",
    description: "Foundations, reliability, and internal platforms that support the whole company.",
    position: [16, 0, -4] as [number, number, number],
    objectiveSeeds: [
      ["Core reliability", "reduce system instability during peak load", "reliability review"],
      ["Identity mesh", "clean up auth and permissions across surfaces", "access audit"],
      ["Data backbone", "stabilize shared pipelines and event integrity", "pipeline check"],
      ["Observability deck", "increase visibility into real customer impact", "metric scan"],
      ["Toolchain flow", "remove friction from internal engineering workflows", "tooling tidy"],
    ],
  },
  {
    id: "galaxy-lumen",
    name: "Lumen",
    category: "Experience",
    color: "#f59e0b",
    accent: "#fef3c7",
    description: "Interface quality, clarity, and product moments that shape perception.",
    position: [24, 4, 4] as [number, number, number],
    objectiveSeeds: [
      ["Navigation clarity", "make movement through the product feel obvious", "ux review"],
      ["Visual quality", "raise consistency across key product surfaces", "visual pass"],
      ["Motion system", "make transitions clearer and calmer", "motion review"],
      ["Accessibility sweep", "close the most visible usability gaps", "a11y scan"],
      ["Empty states", "make low-data moments more useful and reassuring", "empty-state polish"],
    ],
  },
  {
    id: "galaxy-forge",
    name: "Forge",
    category: "Operations",
    color: "#f87171",
    accent: "#fee2e2",
    description: "Process, planning, and internal execution systems that keep the company aligned.",
    position: [20, -3, 12] as [number, number, number],
    objectiveSeeds: [
      ["Planning cadence", "reduce drift between planning and execution", "planning reset"],
      ["Meeting health", "cut meeting overhead and increase decision quality", "agenda review"],
      ["Staffing map", "match capacity to critical work more accurately", "capacity sync"],
      ["Dependency radar", "surface blockers earlier across teams", "dependency check"],
      ["Decision log", "keep important context visible and searchable", "decision capture"],
    ],
  },
  {
    id: "galaxy-harbor",
    name: "Harbor",
    category: "Customer Success",
    color: "#2dd4bf",
    accent: "#ccfbf1",
    description: "Onboarding, support, and customer health systems designed for long-term trust.",
    position: [8, -4, 18] as [number, number, number],
    objectiveSeeds: [
      ["Support calm", "reduce support turbulence during busy periods", "support review"],
      ["Onboarding path", "help new customers gain confidence faster", "onboarding audit"],
      ["Health signals", "turn scattered data into clearer customer health", "health review"],
      ["Escalation flow", "improve handoff quality in urgent cases", "escalation drill"],
      ["Advocacy circle", "identify and grow highly engaged accounts", "advocacy outreach"],
    ],
  },
  {
    id: "galaxy-prism",
    name: "Prism",
    category: "Intelligence",
    color: "#c084fc",
    accent: "#f5d0fe",
    description: "Metrics, research, and insight systems that turn data into decision support.",
    position: [-2, 1, 22] as [number, number, number],
    objectiveSeeds: [
      ["Signal quality", "clean up noisy metrics and restore trust", "metric check"],
      ["Insight pipeline", "move findings to teams faster", "insight publish"],
      ["Experiment memory", "retain learning from prior tests", "experiment recap"],
      ["Forecast engine", "improve confidence in near-term planning", "forecast review"],
      ["Reporting layer", "make weekly reporting less manual and more useful", "report refresh"],
    ],
  },
  {
    id: "galaxy-meridian",
    name: "Meridian",
    category: "Finance",
    color: "#22c55e",
    accent: "#dcfce7",
    description: "Revenue, billing, and planning mechanics that keep the business healthy.",
    position: [-14, 3, 16] as [number, number, number],
    objectiveSeeds: [
      ["Billing integrity", "reduce ambiguity in invoicing and collection", "billing review"],
      ["Forecast discipline", "tighten planning confidence across scenarios", "forecast sync"],
      ["Margin watch", "track cost drift before it becomes structural", "margin scan"],
      ["Spend visibility", "make team-level spend easier to understand", "spend audit"],
      ["Renewal readiness", "coordinate finance support for strategic renewals", "renewal prep"],
    ],
  },
  {
    id: "galaxy-cedar",
    name: "Cedar",
    category: "Personal Systems",
    color: "#84cc16",
    accent: "#ecfccb",
    description: "Health, learning, and personal routines that create durable individual momentum.",
    position: [-24, -2, 8] as [number, number, number],
    objectiveSeeds: [
      ["Energy baseline", "stabilize sleep, food, and recovery routines", "energy check"],
      ["Learning loop", "turn reading and courses into repeat practice", "learning review"],
      ["Fitness arc", "improve consistency in strength and mobility work", "training log"],
      ["Focus hygiene", "reduce distraction and protect deep work", "focus review"],
      ["Life admin", "keep recurring personal obligations under control", "life admin sweep"],
    ],
  },
] as const;

const orbitRadii = [4.4, 5.4, 6.6, 7.8, 9];
const objectiveTaskTemplates = [
  { label: "Map baseline", verb: "capture the current baseline for" },
  { label: "Ship workflow", verb: "deliver the next working slice of" },
  { label: "Automate follow-up", verb: "remove repeated manual effort from" },
  { label: "Review signal", verb: "verify health and decision quality around" },
] as const;
const subtaskTemplates = [
  "Draft owner checklist",
  "Validate latest metrics",
  "Review edge cases",
] as const;
const taskStates: TaskState[] = ["in_progress", "todo", "done", "blocked"];
const habitCadences: HabitCadence[] = ["daily", "weekly", "weekly", "daily", "monthly"];

function titleCase(value: string) {
  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function normalizeId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function mapSubtask(subtask: DomainSubtask): DomainSubtask {
  return {
    id: subtask.id,
    name: subtask.name,
    progress: subtask.progress,
    dueDate: subtask.dueDate,
    metadata: subtask.metadata,
  };
}

function mapTask(task: DomainTask): DomainTask {
  return {
    id: task.id,
    name: task.name,
    state: task.state,
    progress: task.progress,
    dueDate: task.dueDate,
    summary: task.summary,
    subtasks: task.subtasks.map(mapSubtask),
  };
}

function mapObjective(objective: DomainObjective): DomainObjective {
  return {
    id: objective.id,
    name: objective.name,
    description: objective.description,
    orbitRadius: objective.orbitRadius,
    habitIds: [...objective.habitIds],
    tasks: objective.tasks.map(mapTask),
  };
}

function mapCategory(category: DomainCategory): DomainCategory {
  return {
    id: category.id,
    name: category.name,
    category: category.category,
    color: category.color,
    accent: category.accent,
    description: category.description,
    position: [...category.position] as [number, number, number],
    objectives: category.objectives.map(mapObjective),
  };
}

function mapHabit(habit: Habit): Habit {
  return {
    id: habit.id,
    name: habit.name,
    description: habit.description,
    cadence: habit.cadence,
    target: habit.target,
    completedCount: habit.completedCount,
    streak: habit.streak,
    metricLabel: habit.metricLabel,
    linkedObjectiveIds: [...habit.linkedObjectiveIds],
  };
}

function buildObjectiveTasks(galaxyId: string, objectiveSlug: string, objectiveTopic: string): DomainTask[] {
  return objectiveTaskTemplates.map((template, taskIndex) => {
    const state = taskStates[taskIndex % taskStates.length];
    const progress =
      state === "done"
        ? 100
        : state === "blocked"
          ? 41 + taskIndex * 3
          : state === "in_progress"
            ? 58 + taskIndex * 6
            : 22 + taskIndex * 5;

    return {
      id: `task-${galaxyId}-${objectiveSlug}-${taskIndex + 1}`,
      name: `${template.label} ${titleCase(objectiveTopic)}`,
      state,
      progress,
      dueDate:
        state === "done"
          ? "Completed"
          : state === "blocked"
            ? "Blocked"
            : `Q${(taskIndex % 4) + 1} checkpoint`,
      summary: `${titleCase(template.verb)} ${objectiveTopic} with a calmer and more reliable operating model.`,
      subtasks: subtaskTemplates.map((subtaskLabel, subtaskIndex) => ({
        id: `sub-${galaxyId}-${objectiveSlug}-${taskIndex + 1}-${subtaskIndex + 1}`,
        name: `${subtaskLabel} ${titleCase(objectiveTopic)}`,
        progress: state === "done" ? 100 : Math.min(96, progress - 8 + subtaskIndex * 7),
        dueDate: state === "done" ? "Closed" : `Week ${subtaskIndex + taskIndex + 2}`,
        metadata: `${subtaskLabel.toLowerCase()} for ${objectiveTopic} and document what changed.`,
      })),
    };
  });
}

function seedWorkspace(): WorkspaceDomain {
  const categories: DomainCategory[] = [];
  const habits: Habit[] = [];

  galaxyProfiles.forEach((profile, galaxyIndex) => {
    const objectives: DomainObjective[] = profile.objectiveSeeds.map((seed, objectiveIndex) => {
      const [name, descriptionTopic, habitTopic] = seed;
      const objectiveSlug = normalizeId(name);
      const objectiveId = `obj-${profile.id}-${objectiveSlug}`;
      const primaryHabitId = `habit-${profile.id}-${objectiveSlug}-cadence`;
      const secondaryHabitId = `habit-${profile.id}-${objectiveSlug}-quality`;

      habits.push(
        {
          id: primaryHabitId,
          name: `${titleCase(habitTopic)} cadence`,
          description: `Maintain a repeatable rhythm around ${habitTopic} so the objective keeps moving every week.`,
          cadence: habitCadences[objectiveIndex % habitCadences.length],
          target: objectiveIndex % 2 === 0 ? 5 : 3,
          completedCount: objectiveIndex % 2 === 0 ? 4 : 2,
          streak: 4 + galaxyIndex + objectiveIndex,
          metricLabel: objectiveIndex % 2 === 0 ? "sessions / week" : "reviews / week",
          linkedObjectiveIds: [objectiveId],
        },
        {
          id: secondaryHabitId,
          name: `${titleCase(habitTopic)} quality pass`,
          description: `Review the quality of ${habitTopic} outputs so the objective compounds instead of drifting.`,
          cadence: objectiveIndex % 3 === 0 ? "weekly" : "monthly",
          target: objectiveIndex % 3 === 0 ? 2 : 1,
          completedCount: 1,
          streak: 2 + objectiveIndex,
          metricLabel: objectiveIndex % 3 === 0 ? "checks / week" : "checks / month",
          linkedObjectiveIds: [objectiveId],
        },
      );

      return {
        id: objectiveId,
        name,
        description: `${titleCase(descriptionTopic)} across teams, systems, and routines without adding operational noise.`,
        orbitRadius: orbitRadii[objectiveIndex],
        habitIds: [primaryHabitId, secondaryHabitId],
        tasks: buildObjectiveTasks(profile.id, objectiveSlug, descriptionTopic),
      };
    });

    categories.push({
      id: profile.id,
      name: profile.name,
      category: profile.category,
      color: profile.color,
      accent: profile.accent,
      description: profile.description,
      position: profile.position,
      objectives,
    });
  });

  return {
    id: "workspace-orbyte",
    title: "Orbyte Universe",
    summary:
      "A cinematic productivity cosmos where galaxies hold strategic domains, solar systems hold objectives, and planets carry the work that moves them forward.",
    categories,
    habits,
  };
}

function cloneWorkspace(workspace: WorkspaceDomain): WorkspaceDomain {
  return {
    id: workspace.id,
    title: workspace.title,
    summary: workspace.summary,
    categories: workspace.categories.map(mapCategory),
    habits: workspace.habits.map(mapHabit),
  };
}

export async function readWorkspaceDomain(): Promise<WorkspaceDomain> {
  if (IS_VERCEL_RUNTIME && memoryWorkspace) {
    return cloneWorkspace(memoryWorkspace);
  }

  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as WorkspaceDomain;

    if (IS_VERCEL_RUNTIME) {
      memoryWorkspace = cloneWorkspace(parsed);
      return cloneWorkspace(parsed);
    }

    return parsed;
  } catch {
    const initial = seedWorkspace();

    if (IS_VERCEL_RUNTIME) {
      memoryWorkspace = cloneWorkspace(initial);
      return cloneWorkspace(initial);
    }

    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(DATA_FILE, `${JSON.stringify(initial, null, 2)}\n`, "utf8");
    return cloneWorkspace(initial);
  }
}

export async function writeWorkspaceDomain(workspace: WorkspaceDomain): Promise<WorkspaceDomain> {
  const snapshot = cloneWorkspace(workspace);

  if (IS_VERCEL_RUNTIME) {
    memoryWorkspace = cloneWorkspace(snapshot);
    return cloneWorkspace(snapshot);
  }

  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  return snapshot;
}
