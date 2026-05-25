"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, LoaderCircle, PencilLine, Plus, RotateCcw, Sparkles, Trash2, X } from "lucide-react";

import { useUniverseStore } from "@/store/universe-store";
import type { WorkspaceDomain } from "@/types/domain";

type Props = {
  workspace: WorkspaceDomain;
  selectedGalaxyId: string | null;
  selectedObjectiveId: string | null;
  selectedTaskId: string | null;
  selectedSubtaskId: string | null;
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

export function TaskFocusModal({
  workspace,
  selectedGalaxyId,
  selectedObjectiveId,
  selectedTaskId,
  selectedSubtaskId,
  onRefreshData,
}: Props) {
  const selectTask = useUniverseStore((state) => state.selectTask);
  const selectSubtask = useUniverseStore((state) => state.selectSubtask);
  const taskModalOpen = useUniverseStore((state) => state.taskModalOpen);
  const closeTaskModal = useUniverseStore((state) => state.closeTaskModal);
  const [draftName, setDraftName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const category = workspace.categories.find((item) => item.id === selectedGalaxyId) ?? null;
  const objective = category?.objectives.find((item) => item.id === selectedObjectiveId) ?? null;
  const task = objective?.tasks.find((item) => item.id === selectedTaskId) ?? null;
  const subtask = task?.subtasks.find((item) => item.id === selectedSubtaskId) ?? null;

  const modalMode = subtask ? "subtask" : task ? "task" : null;

  function run(action: () => Promise<void>) {
    startTransition(() => {
      void action().catch((issue: unknown) => {
        setError(issue instanceof Error ? issue.message : "Unexpected error.");
      });
    });
  }

  if (!modalMode || !task) {
    return null;
  }

  const currentEntityKey = `${selectedTaskId ?? "task"}:${selectedSubtaskId ?? "subtask"}`;

  const closeLabel = modalMode === "subtask" ? "Close subtask" : task.state === "done" ? "Reopen task" : "Close task";
  const backLabel = modalMode === "subtask" ? "Back to task" : "Back to objective";
  const dismissModal = () => {
    if (modalMode === "subtask") {
      selectSubtask(null);
      selectTask(null);
      closeTaskModal();
      return;
    }

    closeTaskModal();
  };

  if (!taskModalOpen) return null;

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
          className="absolute inset-0 bg-[rgba(2,6,23,0.68)] backdrop-blur-[6px]"
          onClick={dismissModal}
          aria-label="Close task detail modal"
        />

        <motion.div
          key={currentEntityKey}
          data-universe-ui="true"
          className="absolute inset-x-4 bottom-4 max-h-[calc(100svh-32px)] max-h-[calc(100dvh-32px)] overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/88 p-16 shadow-[0_30px_120px_rgba(2,6,23,0.46)] backdrop-blur-2xl md:inset-x-auto md:bottom-12 md:left-1/2 md:max-h-[min(88vh,820px)] md:w-[520px] md:-translate-x-1/2"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-sky-300/16 via-violet-300/10 to-transparent" />
          <div className="relative flex items-start justify-between gap-12">
            <div className="min-w-0 pr-56">
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                {modalMode === "subtask" ? "Subtask modal" : "Task modal"}
              </p>
              <h2 className="mt-8 text-[26px] leading-[1.04] font-semibold tracking-[-0.05em] text-white">
                {modalMode === "subtask" ? subtask?.name : task.name}
              </h2>
              <p className="mt-8 text-sm leading-[1.6] text-slate-300">
                {modalMode === "subtask"
                  ? `${category?.name ?? "Universe"} / ${objective?.name ?? "Objective"} / ${task.name}`
                  : task.summary}
              </p>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                dismissModal();
              }}
              className="absolute right-0 top-0 z-20 inline-flex size-40 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.08] text-slate-100 shadow-[0_10px_30px_rgba(2,6,23,0.24)] transition hover:bg-white/[0.12]"
              aria-label="Close modal"
            >
              <X className="size-18" />
            </button>
          </div>

          <div className="mt-16 grid max-h-[calc(100svh-164px)] max-h-[calc(100dvh-164px)] gap-12 overflow-y-auto pr-4 md:max-h-[min(72vh,640px)]" style={{ touchAction: "pan-y" }}>
            <div className="grid gap-8">
              <button
                type="button"
                onClick={() => {
                  if (modalMode === "subtask") {
                    selectSubtask(null);
                    return;
                  }

                  closeTaskModal();
                  selectTask(null);
                }}
                className="inline-flex items-center justify-center gap-6 rounded-[14px] border border-white/10 bg-white/[0.04] px-10 py-8 text-xs uppercase tracking-[0.14em] text-slate-100 transition hover:bg-white/[0.08]"
              >
                <ArrowLeft className="size-14" />
                {backLabel}
              </button>
            </div>

            <div className="grid gap-8 rounded-[20px] border border-white/8 bg-white/[0.03] p-12">
              <div className="flex flex-wrap items-center gap-8">
                <span className="rounded-full border border-white/8 bg-white/[0.03] px-8 py-4 text-[10px] uppercase tracking-[0.16em] text-slate-300">
                  {category?.name ?? "Universe"}
                </span>
                <span className="rounded-full border border-white/8 bg-white/[0.03] px-8 py-4 text-[10px] uppercase tracking-[0.16em] text-slate-300">
                  {objective?.name ?? "Objective"}
                </span>
                <span className="rounded-full border border-sky-300/16 bg-sky-400/10 px-8 py-4 text-[10px] uppercase tracking-[0.16em] text-sky-100">
                  {modalMode === "subtask" ? `${subtask?.progress ?? 0}%` : `${task.progress}%`}
                </span>
              </div>
              <div className="h-8 overflow-hidden rounded-full bg-white/8">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 via-violet-400 to-emerald-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${modalMode === "subtask" ? subtask?.progress ?? 0 : task.progress}%` }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>

            <div className="grid gap-8 rounded-[20px] border border-white/8 bg-white/[0.03] p-12">
              <div className="flex items-center justify-between gap-12">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Edit {modalMode}</p>
                {isPending ? <LoaderCircle className="size-16 animate-spin text-slate-300" /> : null}
              </div>
              <form
                key={`edit-${currentEntityKey}`}
                className="grid gap-8"
                onSubmit={(event) => {
                  event.preventDefault();
                  const formData = new FormData(event.currentTarget);
                  const name = String(formData.get("name") ?? "").trim();
                  const summary = String(formData.get("summary") ?? "").trim();
                  const metadata = String(formData.get("metadata") ?? "").trim();

                  if (!name) {
                    return;
                  }

                  run(async () => {
                    setError(null);

                    if (modalMode === "subtask" && subtask) {
                      await request(`/api/subtasks/${subtask.id}`, {
                        method: "PATCH",
                        body: JSON.stringify({
                          name,
                          metadata,
                        }),
                      });
                    } else {
                      await request(`/api/tasks/${task.id}`, {
                        method: "PATCH",
                        body: JSON.stringify({
                          name,
                          summary,
                        }),
                      });
                    }

                    await onRefreshData();
                  });
                }}
              >
                <input
                  name="name"
                  defaultValue={modalMode === "subtask" ? subtask?.name ?? "" : task.name}
                  placeholder={modalMode === "subtask" ? "Subtask name" : "Task name"}
                  className="rounded-[14px] border border-white/10 bg-slate-950/70 px-10 py-8 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-300/30"
                />
                {modalMode === "task" ? (
                  <textarea
                    name="summary"
                    defaultValue={task.summary}
                    rows={3}
                    placeholder="Task summary"
                    className="rounded-[14px] border border-white/10 bg-slate-950/70 px-10 py-8 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-300/30"
                  />
                ) : (
                  <textarea
                    name="metadata"
                    defaultValue={subtask?.metadata ?? ""}
                    rows={3}
                    placeholder="Subtask metadata"
                    className="rounded-[14px] border border-white/10 bg-slate-950/70 px-10 py-8 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-300/30"
                  />
                )}
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-6 rounded-[14px] border border-violet-300/18 bg-violet-400/10 px-10 py-8 text-xs uppercase tracking-[0.14em] text-violet-50 transition hover:bg-violet-400/16"
                >
                  <PencilLine className="size-14" />
                  Save changes
                </button>
              </form>
            </div>

            {modalMode === "task" ? (
              <div className="grid gap-8 rounded-[20px] border border-white/8 bg-white/[0.03] p-12">
                <div className="flex items-center justify-between gap-12">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Create subtask</p>
                  {isPending ? <LoaderCircle className="size-16 animate-spin text-slate-300" /> : null}
                </div>
                <div className="flex gap-8">
                  <input
                    value={draftName}
                    onChange={(event) => setDraftName(event.target.value)}
                    placeholder="New subtask"
                    className="min-w-0 flex-1 rounded-[14px] border border-white/10 bg-slate-950/70 px-10 py-8 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-300/30"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      run(async () => {
                        if (!draftName.trim()) {
                          return;
                        }

                        setError(null);
                        await request("/api/subtasks", {
                          method: "POST",
                          body: JSON.stringify({
                            taskId: task.id,
                            name: draftName,
                            progress: 0,
                            dueDate: "Planned",
                            metadata: `${draftName} subtask`,
                          }),
                        });
                        setDraftName("");
                        await onRefreshData();
                      })
                    }
                    disabled={!draftName.trim()}
                    className="inline-flex items-center gap-6 rounded-[14px] border border-sky-300/20 bg-sky-400/10 px-10 py-8 text-xs uppercase tracking-[0.14em] text-sky-50 transition hover:bg-sky-400/16 disabled:opacity-40"
                  >
                    <Plus className="size-14" />
                    Add
                  </button>
                </div>
              </div>
            ) : null}

            {modalMode === "task" ? (
              <div className="grid gap-8 rounded-[20px] border border-white/8 bg-white/[0.03] p-12">
                <div className="flex items-center justify-between gap-12">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Subtasks</p>
                  <span className="rounded-full border border-white/8 bg-white/[0.03] px-8 py-4 text-[10px] text-slate-400">
                    {task.subtasks.length}
                  </span>
                </div>
                <div className="grid gap-8">
                  {task.subtasks.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectSubtask(item.id)}
                      className={`rounded-[16px] border p-10 text-left transition ${
                        selectedSubtaskId === item.id
                          ? "border-sky-300/20 bg-sky-400/10"
                          : "border-white/8 bg-white/[0.03] hover:bg-white/[0.06]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-12">
                        <p className="text-sm font-medium text-white">{item.name}</p>
                        <span className="text-xs text-slate-400">{item.progress}%</span>
                      </div>
                      <p className="mt-6 text-xs text-slate-400">{item.metadata}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="grid gap-8 md:grid-cols-2">
              <button
                type="button"
                onClick={() =>
                  run(async () => {
                    setError(null);

                    if (modalMode === "subtask" && subtask) {
                      await request(`/api/subtasks/${subtask.id}`, {
                        method: "PATCH",
                        body: JSON.stringify({
                          progress: subtask.progress === 100 ? 0 : 100,
                        }),
                      });
                    } else {
                      await request(`/api/tasks/${task.id}`, {
                        method: "PATCH",
                        body: JSON.stringify({
                          state: task.state === "done" ? "todo" : "done",
                          progress: task.state === "done" ? 0 : 100,
                        }),
                      });
                    }

                    await onRefreshData();
                  })
                }
                className="inline-flex items-center justify-center gap-6 rounded-[14px] border border-emerald-300/18 bg-emerald-400/10 px-10 py-8 text-xs uppercase tracking-[0.14em] text-emerald-50 transition hover:bg-emerald-400/16"
              >
                {modalMode === "subtask" ? (
                  (subtask?.progress ?? 0) === 100 ? (
                    <RotateCcw className="size-14" />
                  ) : (
                    <CheckCircle2 className="size-14" />
                  )
                ) : task.state === "done" ? (
                  <RotateCcw className="size-14" />
                ) : (
                  <CheckCircle2 className="size-14" />
                )}
                {closeLabel}
              </button>
              <button
                type="button"
                onClick={() =>
                  run(async () => {
                    setError(null);

                    if (modalMode === "subtask" && subtask) {
                      await request(`/api/subtasks/${subtask.id}`, { method: "DELETE" });
                      selectSubtask(null);
                      closeTaskModal();
                    } else {
                      await request(`/api/tasks/${task.id}`, { method: "DELETE" });
                      selectTask(null);
                      closeTaskModal();
                    }

                    await onRefreshData();
                  })
                }
                className="inline-flex items-center justify-center gap-6 rounded-[14px] border border-rose-300/18 bg-rose-400/10 px-10 py-8 text-xs uppercase tracking-[0.14em] text-rose-50 transition hover:bg-rose-400/16"
              >
                <Trash2 className="size-14" />
                Delete
              </button>
            </div>

            {error ? (
              <div className="rounded-[14px] border border-rose-400/20 bg-rose-500/10 px-10 py-8 text-sm text-rose-200">
                {error}
              </div>
            ) : null}

            <div className="flex items-center gap-8 rounded-[16px] border border-white/8 bg-white/[0.03] px-12 py-10 text-xs leading-[1.6] text-slate-400">
              <Sparkles className="size-16 text-violet-300" />
              {modalMode === "subtask"
                ? "Subtasks stay lightweight: close, reopen, or remove them without leaving the current orbit."
                : "Tasks now act as operational surfaces: inspect, create subtasks, close, reopen, and clean up from a focused modal."}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
