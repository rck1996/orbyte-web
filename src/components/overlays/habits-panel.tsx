"use client";

import { useMemo, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Check, Flame, Link2, LoaderCircle, Minus, Plus, Trash2 } from "lucide-react";

import type { Habit, HabitCadence, WorkspaceDomain } from "@/types/domain";

type Props = {
  workspace: WorkspaceDomain;
  selectedGalaxyId: string | null;
  selectedObjectiveId: string | null;
  onRefreshData: () => Promise<void>;
};

type HabitCard = {
  habit: Habit;
  objectiveName: string;
};

async function request(path: string, init?: RequestInit) {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(error?.error ?? "Request failed.");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

const cadenceOptions: HabitCadence[] = ["daily", "weekly", "monthly"];

export function HabitsPanel({
  workspace,
  selectedGalaxyId,
  selectedObjectiveId,
  onRefreshData,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [habitName, setHabitName] = useState("");
  const [habitTarget, setHabitTarget] = useState("5");
  const [habitMetricLabel, setHabitMetricLabel] = useState("sessions / week");
  const [habitCadence, setHabitCadence] = useState<HabitCadence>("daily");

  const selectedCategory =
    workspace.categories.find((category) => category.id === selectedGalaxyId) ?? null;
  const selectedObjective =
    selectedCategory?.objectives.find((objective) => objective.id === selectedObjectiveId) ?? null;

  const visibleHabits = useMemo<HabitCard[]>(() => {
    if (selectedObjective) {
      return workspace.habits
        .filter((habit) => selectedObjective.habitIds.includes(habit.id))
        .map((habit) => ({
          habit,
          objectiveName: selectedObjective.name,
        }));
    }

    if (selectedCategory) {
      const objectiveNames = new Map(
        selectedCategory.objectives.map((objective) => [objective.id, objective.name]),
      );

      return workspace.habits
        .filter((habit) =>
          habit.linkedObjectiveIds.some((objectiveId) => objectiveNames.has(objectiveId)),
        )
        .map((habit) => ({
          habit,
          objectiveName:
            objectiveNames.get(habit.linkedObjectiveIds[0] ?? "") ?? selectedCategory.name,
        }));
    }

    const objectiveNames = new Map(
      workspace.categories
        .flatMap((category) => category.objectives)
        .map((objective) => [objective.id, objective.name]),
    );

    return workspace.habits.map((habit) => ({
      habit,
      objectiveName: objectiveNames.get(habit.linkedObjectiveIds[0] ?? "") ?? "Unlinked",
    }));
  }, [selectedCategory, selectedObjective, workspace]);

  const averageProgress = visibleHabits.length
    ? Math.round(
        visibleHabits.reduce((sum, item) => sum + habitProgress(item.habit), 0) / visibleHabits.length,
      )
    : 0;
  const topStreak = visibleHabits.length
    ? Math.max(...visibleHabits.map((item) => item.habit.streak))
    : 0;

  const panelTitle = selectedObjective
    ? `${selectedObjective.name} habits`
    : selectedCategory
      ? `${selectedCategory.name} habits`
      : "Habit systems";
  const panelDescription = selectedObjective
    ? "Repeated actions that reinforce the selected objective."
    : selectedCategory
      ? "Cadences attached to the current galaxy's objectives."
      : "Cross-system rhythms that influence your long-term progress.";

  function run(action: () => Promise<void>) {
    startTransition(() => {
      void action().catch((issue: unknown) => {
        setError(issue instanceof Error ? issue.message : "Unexpected error.");
      });
    });
  }

  return (
    <motion.aside
      className="pointer-events-auto relative w-full max-w-full overflow-hidden rounded-[20px] border border-cyan-300/12 bg-slate-950/56 p-12 shadow-[0_18px_80px_rgba(8,47,73,0.24)] backdrop-blur-2xl md:max-w-[360px]"
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-cyan-300/14 via-sky-300/10 to-transparent" />
      <div className="flex items-start justify-between gap-12 border-b border-white/8 pb-8">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-200/70">Habit belt</p>
          <p className="mt-4 text-sm text-slate-200">{panelTitle}</p>
          <p className="mt-4 text-xs leading-[1.6] text-slate-400">{panelDescription}</p>
        </div>
        {isPending ? <LoaderCircle className="mt-2 size-16 animate-spin text-cyan-200" /> : null}
      </div>

      <div
        className="mt-12 grid max-h-[46vh] gap-12 overflow-y-auto pr-4 md:max-h-[58vh]"
        style={{ touchAction: "pan-y" }}
      >
        <section className="grid gap-8 rounded-[18px] border border-white/8 bg-white/[0.03] p-12">
          <div className="grid grid-cols-3 gap-8">
            <StatChip label="Visible" value={`${visibleHabits.length}`} />
            <StatChip label="Avg" value={`${averageProgress}%`} />
            <StatChip label="Streak" value={`${topStreak}d`} />
          </div>
        </section>

        {selectedObjective ? (
          <section className="grid gap-8 rounded-[18px] border border-cyan-300/10 bg-cyan-400/[0.03] p-12">
            <p className="text-[10px] uppercase tracking-[0.16em] text-cyan-200/70">Create habit</p>
            <input
              value={habitName}
              onChange={(event) => setHabitName(event.target.value)}
              placeholder="Sleep protocol, daily review, inbox zero"
              className="rounded-[14px] border border-white/10 bg-slate-950/70 px-10 py-8 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/30"
            />
            <div className="grid grid-cols-2 gap-8">
              <input
                value={habitTarget}
                onChange={(event) => setHabitTarget(event.target.value)}
                inputMode="numeric"
                placeholder="Target"
                className="rounded-[14px] border border-white/10 bg-slate-950/70 px-10 py-8 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/30"
              />
              <input
                value={habitMetricLabel}
                onChange={(event) => setHabitMetricLabel(event.target.value)}
                placeholder="sessions / week"
                className="rounded-[14px] border border-white/10 bg-slate-950/70 px-10 py-8 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/30"
              />
            </div>
            <div className="flex flex-wrap gap-8">
              {cadenceOptions.map((cadence) => (
                <button
                  key={cadence}
                  type="button"
                  onClick={() => setHabitCadence(cadence)}
                  className={`rounded-full border px-10 py-6 text-xs uppercase tracking-[0.14em] transition ${
                    habitCadence === cadence
                      ? "border-cyan-300/30 bg-cyan-400/14 text-cyan-100"
                      : "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
                  }`}
                >
                  {cadence}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={!habitName.trim() || !habitMetricLabel.trim()}
              onClick={() =>
                run(async () => {
                  setError(null);
                  await request("/api/habits", {
                    method: "POST",
                    body: JSON.stringify({
                      name: habitName,
                      description: `${habitName} habit`,
                      cadence: habitCadence,
                      target: Number(habitTarget) || 1,
                      completedCount: 0,
                      streak: 0,
                      metricLabel: habitMetricLabel,
                      linkedObjectiveIds: [selectedObjective.id],
                    }),
                  });
                  setHabitName("");
                  setHabitTarget("5");
                  setHabitMetricLabel("sessions / week");
                  await onRefreshData();
                })
              }
              className="inline-flex items-center justify-center gap-6 rounded-[14px] border border-cyan-300/20 bg-cyan-400/10 px-10 py-8 text-xs text-cyan-50 transition hover:bg-cyan-400/16 disabled:opacity-40"
            >
              <Plus className="size-14" />
              Add to objective
            </button>
          </section>
        ) : (
          <section className="rounded-[18px] border border-white/8 bg-white/[0.03] p-12">
            <p className="text-sm leading-[1.6] text-slate-300">
              Select an objective to create habits directly into its orbit. Without an objective
              focus, this panel stays in observation mode.
            </p>
          </section>
        )}

        {visibleHabits.length ? (
          <div className="grid gap-8">
            {visibleHabits.map(({ habit, objectiveName }) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                objectiveName={objectiveName}
                onAdjust={(nextCompletedCount) =>
                  run(async () => {
                    setError(null);
                    await request(`/api/habits/${habit.id}`, {
                      method: "PATCH",
                      body: JSON.stringify({ completedCount: nextCompletedCount }),
                    });
                    await onRefreshData();
                  })
                }
                onDelete={() =>
                  run(async () => {
                    setError(null);
                    await request(`/api/habits/${habit.id}`, { method: "DELETE" });
                    await onRefreshData();
                  })
                }
              />
            ))}
          </div>
        ) : (
          <section className="rounded-[18px] border border-dashed border-white/10 bg-white/[0.02] p-12">
            <p className="text-sm text-slate-300">No habits are linked to this scope yet.</p>
          </section>
        )}

        {error ? (
          <div className="rounded-[16px] border border-rose-400/20 bg-rose-500/10 px-12 py-10 text-sm text-rose-200">
            {error}
          </div>
        ) : null}
      </div>
    </motion.aside>
  );
}

function habitProgress(habit: Habit) {
  if (habit.target <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((habit.completedCount / habit.target) * 100));
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-white/8 bg-white/[0.03] px-8 py-10">
      <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-6 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function HabitCard({
  habit,
  objectiveName,
  onAdjust,
  onDelete,
}: {
  habit: Habit;
  objectiveName: string;
  onAdjust: (nextCompletedCount: number) => void;
  onDelete: () => void;
}) {
  const progress = habitProgress(habit);

  return (
    <section className="rounded-[18px] border border-cyan-300/10 bg-cyan-400/[0.03] p-12">
      <div className="flex items-start justify-between gap-12">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-8">
            <p className="text-sm font-medium text-white">{habit.name}</p>
            <span className="rounded-full border border-cyan-300/16 bg-cyan-400/12 px-8 py-4 text-[10px] uppercase tracking-[0.14em] text-cyan-100">
              {habit.cadence}
            </span>
          </div>
          <p className="mt-4 text-xs leading-[1.6] text-slate-400">{habit.description}</p>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-6 rounded-full border border-rose-400/20 bg-rose-500/10 px-8 py-6 text-xs text-rose-200 transition hover:bg-rose-500/16"
        >
          <Trash2 className="size-14" />
          Delete
        </button>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-8 text-xs text-slate-400">
        <span className="inline-flex items-center gap-6">
          <Link2 className="size-12" />
          {objectiveName}
        </span>
        <span className="inline-flex items-center gap-6">
          <Check className="size-12" />
          {habit.completedCount}/{habit.target} {habit.metricLabel}
        </span>
        <span className="inline-flex items-center gap-6">
          <Flame className="size-12" />
          {habit.streak} day streak
        </span>
      </div>

      <div className="mt-10 h-8 overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,rgba(34,211,238,0.85),rgba(14,165,233,0.58))]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-10 flex items-center justify-between gap-8">
        <p className="text-xs uppercase tracking-[0.14em] text-cyan-100/80">{progress}% on target</p>
        <div className="flex items-center gap-8">
          <button
            type="button"
            onClick={() => onAdjust(Math.max(0, habit.completedCount - 1))}
            className="inline-flex size-32 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-200 transition hover:bg-white/[0.08]"
            aria-label={`Decrease progress for ${habit.name}`}
          >
            <Minus className="size-14" />
          </button>
          <button
            type="button"
            onClick={() => onAdjust(Math.min(habit.target, habit.completedCount + 1))}
            className="inline-flex size-32 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-400/12 text-cyan-50 transition hover:bg-cyan-400/18"
            aria-label={`Increase progress for ${habit.name}`}
          >
            <Plus className="size-14" />
          </button>
        </div>
      </div>
    </section>
  );
}
