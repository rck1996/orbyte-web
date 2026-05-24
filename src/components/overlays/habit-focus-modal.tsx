"use client";

import { useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Flame, LoaderCircle, RotateCcw, X } from "lucide-react";

import type { Habit } from "@/types/domain";

type Props = {
  habit: Habit | null;
  objectiveName: string | null;
  open: boolean;
  onClose: () => void;
  onRefreshData: () => Promise<void>;
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
    const errorBody = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(errorBody?.error ?? "Request failed.");
  }
}

function habitProgress(habit: Habit) {
  if (habit.target <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((habit.completedCount / habit.target) * 100));
}

export function HabitFocusModal({
  habit,
  objectiveName,
  open,
  onClose,
  onRefreshData,
}: Props) {
  const [isPending, startTransition] = useTransition();

  if (!habit || !open) {
    return null;
  }

  const progress = habitProgress(habit);

  function run(action: () => Promise<void>) {
    startTransition(() => {
      void action();
    });
  }

  return (
    <AnimatePresence>
      <motion.div
        data-universe-ui="true"
        className="pointer-events-auto absolute inset-0 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      >
        <button
          type="button"
          className="absolute inset-0 bg-[rgba(2,6,23,0.66)] backdrop-blur-[6px]"
          onClick={onClose}
          aria-label="Close habit modal"
        />

        <motion.div
          data-universe-ui="true"
          className="absolute inset-x-4 bottom-4 max-h-[calc(100vh-32px)] overflow-hidden rounded-[28px] border border-cyan-300/16 bg-slate-950/90 p-16 shadow-[0_30px_120px_rgba(2,6,23,0.46)] backdrop-blur-2xl md:inset-x-auto md:bottom-12 md:left-1/2 md:max-h-[min(88vh,820px)] md:w-[520px] md:-translate-x-1/2"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-cyan-300/18 via-sky-300/10 to-transparent" />
          <div className="relative pr-56">
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Habit orbit</p>
            <h2 className="mt-8 text-[26px] leading-[1.04] font-semibold tracking-[-0.05em] text-white">
              {habit.name}
            </h2>
            <p className="mt-8 text-sm leading-[1.6] text-slate-300">
              {objectiveName ?? "Objective"} / {habit.description}
            </p>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onClose();
              }}
              className="absolute right-0 top-0 z-20 inline-flex size-40 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.08] text-slate-100 shadow-[0_10px_30px_rgba(2,6,23,0.24)] transition hover:bg-white/[0.12]"
              aria-label="Close habit modal"
            >
              <X className="size-18" />
            </button>
          </div>

          <div
            className="mt-16 grid max-h-[calc(100vh-164px)] gap-12 overflow-y-auto pr-4 md:max-h-[min(72vh,640px)]"
            style={{ touchAction: "pan-y" }}
          >
            <div className="grid gap-8 rounded-[20px] border border-white/8 bg-white/[0.03] p-12">
              <div className="flex flex-wrap items-center gap-8">
                <span className="rounded-full border border-cyan-300/16 bg-cyan-400/10 px-8 py-4 text-[10px] uppercase tracking-[0.16em] text-cyan-100">
                  {habit.cadence}
                </span>
                <span className="rounded-full border border-white/8 bg-white/[0.03] px-8 py-4 text-[10px] uppercase tracking-[0.16em] text-slate-300">
                  {habit.metricLabel}
                </span>
                <span className="rounded-full border border-white/8 bg-white/[0.03] px-8 py-4 text-[10px] uppercase tracking-[0.16em] text-slate-300">
                  {progress}%
                </span>
              </div>
              <div className="h-8 overflow-hidden rounded-full bg-white/8">
                <motion.div
                  className="h-full rounded-full bg-[linear-gradient(90deg,rgba(34,211,238,0.9),rgba(14,165,233,0.6))]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <div className="grid grid-cols-3 gap-8">
                <MetricCard label="Completed" value={`${habit.completedCount}/${habit.target}`} />
                <MetricCard label="Streak" value={`${habit.streak}d`} />
                <MetricCard label="Cadence" value={habit.cadence} />
              </div>
            </div>

            <div className="grid gap-8 rounded-[20px] border border-cyan-300/10 bg-cyan-400/[0.05] p-12">
              <div className="flex items-center justify-between gap-12">
                <p className="text-xs uppercase tracking-[0.16em] text-cyan-100">Rhythm signal</p>
                <span className="rounded-full border border-white/8 bg-white/[0.03] px-8 py-4 text-[10px] uppercase tracking-[0.14em] text-slate-300">
                  {progress >= 100 ? "On cadence" : progress >= 60 ? "Building" : "Needs attention"}
                </span>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                <RhythmStep
                  label="Target"
                  value={`${habit.target} ${habit.metricLabel.toLowerCase()}`}
                  active
                />
                <RhythmStep
                  label="Today"
                  value={habit.completedCount >= habit.target ? "Complete" : "Open"}
                  active={habit.completedCount > 0}
                />
                <RhythmStep
                  label="Momentum"
                  value={habit.streak > 0 ? `${habit.streak} day streak` : "Restart cadence"}
                  active={habit.streak > 0}
                />
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <button
                type="button"
                onClick={() =>
                  run(async () => {
                    await request(`/api/habits/${habit.id}`, {
                      method: "PATCH",
                      body: JSON.stringify({
                        completedCount: Math.min(habit.target, habit.completedCount + 1),
                        streak: habit.streak + 1,
                      }),
                    });
                    await onRefreshData();
                  })
                }
                className="inline-flex items-center justify-center gap-6 rounded-[14px] border border-emerald-300/18 bg-emerald-400/10 px-10 py-8 text-xs uppercase tracking-[0.14em] text-emerald-50 transition hover:bg-emerald-400/16"
              >
                {isPending ? (
                  <LoaderCircle className="size-14 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-14" />
                )}
                Check in
              </button>
              <button
                type="button"
                onClick={() =>
                  run(async () => {
                    await request(`/api/habits/${habit.id}`, {
                      method: "PATCH",
                      body: JSON.stringify({
                        completedCount: Math.max(0, habit.completedCount - 1),
                        streak: Math.max(0, habit.streak - 1),
                      }),
                    });
                    await onRefreshData();
                  })
                }
                className="inline-flex items-center justify-center gap-6 rounded-[14px] border border-white/10 bg-white/[0.04] px-10 py-8 text-xs uppercase tracking-[0.14em] text-slate-100 transition hover:bg-white/[0.08]"
              >
                <RotateCcw className="size-14" />
                Undo check-in
              </button>
            </div>

            <div className="flex items-center gap-8 rounded-[16px] border border-white/8 bg-white/[0.03] px-12 py-10 text-xs leading-[1.6] text-slate-400">
              <Flame className="size-16 text-cyan-300" />
              <span>
                Habits should feel like recurring momentum, not chores. This surface prioritizes quick
                logging, streak visibility, and progress without dragging you into admin work.
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-white/8 bg-white/[0.03] px-10 py-10">
      <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-6 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function RhythmStep({
  label,
  value,
  active = false,
}: {
  label: string;
  value: string;
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-[14px] border px-10 py-10 ${
        active ? "border-cyan-300/16 bg-cyan-400/[0.06]" : "border-white/8 bg-white/[0.03]"
      }`}
    >
      <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-6 text-sm font-medium text-white">{value}</p>
    </div>
  );
}
