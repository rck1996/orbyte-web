"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Clock3, LoaderCircle, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  getFocusDescription,
  getFocusEntity,
  getFocusProgress,
  getFocusTasks,
  getFocusTitle,
} from "@/lib/space";
import type { WorkspaceDomain } from "@/types/domain";
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

const accentByFocus = {
  map: {
    edge: "border-sky-300/14",
    glow: "from-sky-400/16 via-violet-400/10 to-transparent",
    chip: "border-sky-300/18 bg-sky-400/10 text-sky-100",
  },
  galaxy: {
    edge: "border-violet-300/14",
    glow: "from-violet-400/18 via-sky-400/10 to-transparent",
    chip: "border-violet-300/18 bg-violet-400/10 text-violet-100",
  },
  objective: {
    edge: "border-amber-300/16",
    glow: "from-amber-300/18 via-orange-300/10 to-transparent",
    chip: "border-amber-300/18 bg-amber-400/10 text-amber-100",
  },
  task: {
    edge: "border-emerald-300/14",
    glow: "from-emerald-300/18 via-sky-300/10 to-transparent",
    chip: "border-emerald-300/18 bg-emerald-400/10 text-emerald-100",
  },
  subtask: {
    edge: "border-cyan-300/14",
    glow: "from-cyan-300/18 via-sky-300/10 to-transparent",
    chip: "border-cyan-300/18 bg-cyan-400/10 text-cyan-100",
  },
} as const;

export function FocusPanel({
  universe,
  workspace,
  selectedGalaxyId,
  selectedObjectiveId,
  selectedTaskId,
  selectedSubtaskId,
  onRefreshData,
}: {
  universe: UniverseData;
  workspace: WorkspaceDomain;
  selectedGalaxyId: string | null;
  selectedObjectiveId: string | null;
  selectedTaskId: string | null;
  selectedSubtaskId: string | null;
  onRefreshData: () => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const focus = getFocusEntity(
    universe,
    selectedGalaxyId,
    selectedObjectiveId,
    selectedTaskId,
    selectedSubtaskId,
  );
  const relatedTasks = getFocusTasks(focus);
  const focusProgress = getFocusProgress(focus);

  const task = focus.task;
  const subtask = focus.subtask;
  const state = task ? stateLabel[task.state] : null;
  const Icon = state?.icon;
  const panelLabel = subtask
    ? "Subtask detail"
    : task
    ? "Task detail"
    : focus.objective
      ? "Objective detail"
      : focus.galaxy
        ? "Galaxy detail"
        : "Universe map";
  const focusKind = subtask
    ? "subtask"
    : task
      ? "task"
      : focus.objective
        ? "objective"
        : focus.galaxy
          ? "galaxy"
          : "map";
  const accent = accentByFocus[focusKind];
  const selectedCategory =
    workspace.categories.find((item) => item.id === selectedGalaxyId) ?? null;
  const selectedObjective =
    selectedCategory?.objectives.find((item) => item.id === selectedObjectiveId) ?? null;
  const selectedTask =
    selectedObjective?.tasks.find((item) => item.id === selectedTaskId) ?? null;
  const focusKey = [
    selectedGalaxyId ?? "map",
    selectedObjectiveId ?? "objective",
    selectedTaskId ?? "task",
    selectedSubtaskId ?? "subtask",
  ].join(":");

  const createLabel =
    focusKind === "map"
      ? "New galaxy"
      : focusKind === "galaxy"
        ? "New objective"
        : focusKind === "objective"
          ? "New task"
          : focusKind === "task"
            ? "New subtask"
            : null;

  function run(action: () => Promise<void>) {
    startTransition(() => {
      void action().catch((issue: unknown) => {
        setError(issue instanceof Error ? issue.message : "Unexpected error.");
      });
    });
  }

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

  function handleCreate() {
    if (!draftName.trim()) {
      return;
    }

    run(async () => {
      setError(null);

      if (focusKind === "map") {
        await request("/api/categories", {
          method: "POST",
          body: JSON.stringify({
            name: draftName,
            category: "Custom",
            color: "#7dd3fc",
            accent: "#e0f2fe",
            description: `${draftName} system`,
            position: [0, 0, 0],
          }),
        });
      } else if (focusKind === "galaxy" && selectedCategory) {
        await request("/api/objectives", {
          method: "POST",
          body: JSON.stringify({
            categoryId: selectedCategory.id,
            name: draftName,
            description: `${draftName} objective`,
            orbitRadius: 4 + selectedCategory.objectives.length * 1.4,
            habitIds: [],
          }),
        });
      } else if (focusKind === "objective" && selectedObjective) {
        await request("/api/tasks", {
          method: "POST",
          body: JSON.stringify({
            objectiveId: selectedObjective.id,
            name: draftName,
            state: "todo",
            progress: 0,
            dueDate: "Planned",
            summary: `${draftName} task`,
          }),
        });
      } else if (focusKind === "task" && selectedTask) {
        await request("/api/subtasks", {
          method: "POST",
          body: JSON.stringify({
            taskId: selectedTask.id,
            name: draftName,
            progress: 0,
            dueDate: "Planned",
            metadata: `${draftName} subtask`,
          }),
        });
      }

      setDraftName("");
      await onRefreshData();
    });
  }

  function handleCompleteOrReopen() {
    run(async () => {
      setError(null);

      if (focusKind === "task" && selectedTask) {
        const nextDone = selectedTask.state !== "done";
        await request(`/api/tasks/${selectedTask.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            state: nextDone ? "done" : "todo",
            progress: nextDone ? 100 : 0,
          }),
        });
      } else if (focusKind === "subtask" && selectedTask && subtask) {
        const nextDone = subtask.progress < 100;
        await request(`/api/subtasks/${subtask.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            progress: nextDone ? 100 : 0,
          }),
        });
      } else if (focusKind === "objective" && selectedObjective) {
        await Promise.all(
          selectedObjective.tasks
            .filter((item) => item.state !== "done")
            .map((item) =>
              request(`/api/tasks/${item.id}`, {
                method: "PATCH",
                body: JSON.stringify({ state: "done", progress: 100 }),
              }),
            ),
        );
      } else if (focusKind === "galaxy" && selectedCategory) {
        await Promise.all(
          selectedCategory.objectives.flatMap((objectiveItem) =>
            objectiveItem.tasks
              .filter((item) => item.state !== "done")
              .map((item) =>
                request(`/api/tasks/${item.id}`, {
                  method: "PATCH",
                  body: JSON.stringify({ state: "done", progress: 100 }),
                }),
              ),
          ),
        );
      }

      await onRefreshData();
    });
  }

  function handleDelete() {
    run(async () => {
      setError(null);

      if (focusKind === "galaxy" && selectedCategory) {
        await request(`/api/categories/${selectedCategory.id}`, { method: "DELETE" });
      } else if (focusKind === "objective" && selectedObjective) {
        await request(`/api/objectives/${selectedObjective.id}`, { method: "DELETE" });
      } else if (focusKind === "task" && selectedTask) {
        await request(`/api/tasks/${selectedTask.id}`, { method: "DELETE" });
      } else if (focusKind === "subtask" && subtask) {
        await request(`/api/subtasks/${subtask.id}`, { method: "DELETE" });
      } else {
        return;
      }

      await onRefreshData();
    });
  }

  const canComplete =
    focusKind === "task" ||
    focusKind === "subtask" ||
    (focusKind === "objective" && Boolean(selectedObjective?.tasks.length)) ||
    (focusKind === "galaxy" &&
      Boolean(selectedCategory?.objectives.some((objectiveItem) => objectiveItem.tasks.length > 0)));
  const completeLabel =
    focusKind === "task"
      ? selectedTask?.state === "done"
        ? "Reopen task"
        : "Close task"
      : focusKind === "subtask"
        ? subtask?.progress === 100
          ? "Reopen subtask"
          : "Close subtask"
        : focusKind === "objective"
          ? "Close objective tasks"
          : focusKind === "galaxy"
            ? "Close galaxy tasks"
            : "";

  return (
    <motion.aside
      key={focusKey}
      className={`relative flex max-h-[42vh] w-full max-w-full flex-col overflow-hidden rounded-[20px] border bg-slate-950/52 p-12 shadow-[0_18px_80px_rgba(2,6,23,0.24)] backdrop-blur-2xl md:max-h-[min(58vh,640px)] md:max-w-[320px] ${accent.edge}`}
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-r ${accent.glow}`} />
      <div className="relative flex items-center justify-between gap-12">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{panelLabel}</p>
        <span className={`rounded-full border px-8 py-4 text-[10px] uppercase tracking-[0.16em] ${accent.chip}`}>
          {focusKind}
        </span>
      </div>
      <div className="mt-12 grid min-h-0 flex-1 gap-12 overflow-y-auto pr-4" style={{ touchAction: "pan-y" }}>
        <div>
          <div className="flex flex-wrap gap-8 text-[10px] uppercase tracking-[0.16em] text-slate-400">
            <span className="rounded-full border border-white/8 bg-white/[0.03] px-8 py-4">
              {focus.galaxy?.name ?? "Universe"}
            </span>
            <span className="rounded-full border border-white/8 bg-white/[0.03] px-8 py-4">
              {focus.objective?.name ?? "Navigation"}
            </span>
          </div>
          <h2 className="mt-8 text-xl leading-[1.08] font-semibold text-white md:text-2xl">
            {getFocusTitle(universe, focus)}
          </h2>
        </div>

        <p className="text-sm leading-[1.65] text-slate-300">
          {getFocusDescription(universe, focus)}
        </p>

        <div className="grid gap-12 rounded-[20px] border border-white/8 bg-white/4 p-12">
          {task && state && Icon ? (
            <div className={`flex items-center gap-8 text-sm ${state.tone}`}>
              <Icon className="size-16" aria-hidden="true" />
              <span>{subtask ? `Subtask in ${state.text.toLowerCase()} task` : state.text}</span>
            </div>
          ) : (
            <div className="text-sm text-slate-300">
              {focus.objective ? "Focused objective" : focus.galaxy ? "Focused galaxy" : "Universe overview"}
            </div>
          )}
          <div className="flex items-center justify-between text-sm text-slate-300">
            <span>{focusProgress}% complete</span>
            <span>{subtask?.dueDate ?? task?.dueDate ?? (focus.galaxy ? `${relatedTasks.length} related tasks` : "3 galaxies")}</span>
          </div>
          <div className="h-8 overflow-hidden rounded-full bg-white/8">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 via-violet-400 to-emerald-400"
              initial={{ width: 0 }}
              animate={{ width: `${focusProgress}%` }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>

        <div className="grid gap-8 rounded-[20px] border border-white/8 bg-white/[0.03] p-12">
          <div className="flex items-center justify-between gap-12">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Quick actions</p>
            {isPending ? <LoaderCircle className="size-16 animate-spin text-slate-300" /> : null}
          </div>

          {createLabel ? (
            <div className="grid gap-8">
              <div className="flex gap-8">
                <input
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  placeholder={createLabel}
                  className="min-w-0 flex-1 rounded-[14px] border border-white/10 bg-slate-950/70 px-10 py-8 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-300/30"
                />
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={!draftName.trim()}
                  className="inline-flex items-center gap-6 rounded-[14px] border border-sky-300/20 bg-sky-400/10 px-10 py-8 text-xs uppercase tracking-[0.14em] text-sky-50 transition hover:bg-sky-400/16 disabled:opacity-40"
                >
                  <Plus className="size-14" />
                  Add
                </button>
              </div>
            </div>
          ) : null}

          <div className="grid gap-8 md:grid-cols-2">
            {canComplete ? (
              <button
                type="button"
                onClick={handleCompleteOrReopen}
                className="inline-flex items-center justify-center gap-6 rounded-[14px] border border-emerald-300/18 bg-emerald-400/10 px-10 py-8 text-xs uppercase tracking-[0.14em] text-emerald-50 transition hover:bg-emerald-400/16"
              >
                {focusKind === "task" || focusKind === "subtask" ? (
                  selectedTask?.state === "done" || subtask?.progress === 100 ? (
                    <RotateCcw className="size-14" />
                  ) : (
                    <CheckCircle2 className="size-14" />
                  )
                ) : (
                  <CheckCircle2 className="size-14" />
                )}
                {completeLabel}
              </button>
            ) : null}
            {focusKind !== "map" ? (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center justify-center gap-6 rounded-[14px] border border-rose-300/18 bg-rose-400/10 px-10 py-8 text-xs uppercase tracking-[0.14em] text-rose-50 transition hover:bg-rose-400/16"
              >
                <Trash2 className="size-14" />
                Delete
              </button>
            ) : null}
          </div>

          {error ? (
            <div className="rounded-[14px] border border-rose-400/20 bg-rose-500/10 px-10 py-8 text-sm text-rose-200">
              {error}
            </div>
          ) : null}
        </div>

        <div className="grid gap-8">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.14em] text-slate-400">
            <span>Related tasks</span>
            <span>{relatedTasks.length}</span>
          </div>
          <div className="grid gap-8">
            {relatedTasks.map((relatedTask) => (
              <motion.div
                key={relatedTask.id}
                className="rounded-[16px] border border-white/8 bg-white/[0.03] p-10"
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center justify-between gap-12">
                  <p className="text-sm font-medium text-white">{relatedTask.name}</p>
                  <span className="text-xs text-slate-400">{relatedTask.progress}%</span>
                </div>
                <p className="mt-8 text-xs leading-[1.6] text-slate-300">
                  {relatedTask.summary}
                </p>
                <div className="mt-8 h-4 overflow-hidden rounded-full bg-white/8">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${relatedTask.progress}%` }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </motion.div>
            ))}
            {relatedTasks.length === 0 ? (
              <div className="rounded-[16px] border border-white/8 bg-white/[0.03] p-12 text-sm text-slate-300">
                Select a galaxy to enter a system, then drill down into objectives and tasks.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
