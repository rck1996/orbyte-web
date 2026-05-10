"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Clock3, LoaderCircle } from "lucide-react";

import { getFocusEntity } from "@/lib/space";
import type { UniverseData } from "@/types/universe";

const stateLabel = {
  todo: {
    icon: Clock3,
    text: "Queued",
    tone: "text-slate-300",
  },
  in_progress: {
    icon: LoaderCircle,
    text: "In progress",
    tone: "text-sky-300",
  },
  done: {
    icon: CheckCircle2,
    text: "Completed",
    tone: "text-emerald-300",
  },
  blocked: {
    icon: AlertTriangle,
    text: "Blocked",
    tone: "text-rose-300",
  },
};

export function FocusPanel({
  universe,
  selectedGalaxyId,
  selectedObjectiveId,
  selectedTaskId,
}: {
  universe: UniverseData;
  selectedGalaxyId: string | null;
  selectedObjectiveId: string | null;
  selectedTaskId: string | null;
}) {
  const focus = getFocusEntity(
    universe,
    selectedGalaxyId,
    selectedObjectiveId,
    selectedTaskId,
  );

  const task = focus.task;
  const state = task ? stateLabel[task.state] : null;
  const Icon = state?.icon;

  return (
    <motion.aside
      className="w-full max-w-[420px] rounded-[24px] border border-white/10 bg-slate-950/58 p-16 shadow-[0_18px_80px_rgba(2,6,23,0.38)] backdrop-blur-2xl md:p-24"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Current focus</p>
      <div className="mt-12 grid gap-12">
        <div>
          <p className="text-sm text-slate-400">
            {focus.galaxy?.name ?? "Universe"} / {focus.objective?.name ?? "Navigation"}
          </p>
          <h2 className="mt-8 text-2xl leading-[1.08] font-semibold text-white">
            {task?.name ?? focus.galaxy?.name ?? universe.title}
          </h2>
        </div>

        <p className="text-sm leading-[1.65] text-slate-300">
          {task?.summary ?? focus.objective?.description ?? focus.galaxy?.description ?? universe.summary}
        </p>

        {task && state && Icon ? (
          <div className="grid gap-12 rounded-[20px] border border-white/8 bg-white/4 p-16">
            <div className={`flex items-center gap-8 text-sm ${state.tone}`}>
              <Icon className="size-16" aria-hidden="true" />
              <span>{state.text}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>{task.progress}% complete</span>
              <span>{task.dueDate}</span>
            </div>
            <div className="h-8 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 via-violet-400 to-emerald-400"
                style={{ width: `${task.progress}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </motion.aside>
  );
}
