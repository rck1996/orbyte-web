"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUp, ChevronsLeft, ChevronsRight, Compass, Eye, EyeOff, Map, Orbit, Settings2, Sparkles, Target, Waves } from "lucide-react";

import { FocusPanel } from "@/components/overlays/focus-panel";
import { GalaxyRail } from "@/components/overlays/galaxy-rail";
import { HabitsPanel } from "@/components/overlays/habits-panel";
import { ManagementPanel } from "@/components/overlays/management-panel";
import { TaskFocusModal } from "@/components/overlays/task-focus-modal";
import { useUniverseStore } from "@/store/universe-store";
import type { WorkspaceDomain } from "@/types/domain";
import type { UniverseData } from "@/types/universe";

export function UniverseHud({
  universe,
  workspace,
  onRefreshData,
  presentation = "3d",
}: {
  universe: UniverseData;
  workspace: WorkspaceDomain;
  onRefreshData: () => Promise<void>;
  presentation?: "2d" | "3d";
}) {
  const [sidebarPanel, setSidebarPanel] = useState<"navigate" | "detail" | "habits" | "manage">(
    "navigate",
  );
  const [mobileSheetState, setMobileSheetState] = useState<"peek" | "half" | "full">("half");
  const selectedGalaxyId = useUniverseStore((state) => state.selectedGalaxyId);
  const selectedObjectiveId = useUniverseStore((state) => state.selectedObjectiveId);
  const selectedTaskId = useUniverseStore((state) => state.selectedTaskId);
  const selectedSubtaskId = useUniverseStore((state) => state.selectedSubtaskId);
  const selectGalaxy = useUniverseStore((state) => state.selectGalaxy);
  const selectObjective = useUniverseStore((state) => state.selectObjective);
  const selectTask = useUniverseStore((state) => state.selectTask);
  const selectSubtask = useUniverseStore((state) => state.selectSubtask);
  const zoomToMap = useUniverseStore((state) => state.zoomToMap);
  const stepOut = useUniverseStore((state) => state.stepOut);
  const stepSelection = useUniverseStore((state) => state.stepSelection);
  const interactionMode = useUniverseStore((state) => state.interactionMode);
  const setInteractionMode = useUniverseStore((state) => state.setInteractionMode);
  const [introHidden, setIntroHidden] = useState(true);
  const [detailHidden, setDetailHidden] = useState(true);
  const [manageHidden, setManageHidden] = useState(true);
  const [habitsHidden, setHabitsHidden] = useState(false);
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [compactTouch, setCompactTouch] = useState(false);
  const canStepOut = Boolean(
    selectedGalaxyId || selectedObjectiveId || selectedTaskId || selectedSubtaskId,
  );

  useEffect(() => {
    const media = window.matchMedia("(pointer: coarse) and (max-width: 767px)");
    const update = () => setCompactTouch(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!canStepOut) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      setDetailHidden(false);
      setManageHidden(false);

      if (selectedGalaxyId || selectedObjectiveId) {
        setHabitsHidden(false);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [
    canStepOut,
    selectedGalaxyId,
    selectedObjectiveId,
    selectedTaskId,
    selectedSubtaskId,
  ]);

  const selectedGalaxy =
    universe.galaxies.find((galaxy) => galaxy.id === selectedGalaxyId) ?? null;
  const selectedObjective =
    selectedGalaxy?.objectives.find((objective) => objective.id === selectedObjectiveId) ?? null;
  const selectedTask =
    selectedObjective?.tasks.find((task) => task.id === selectedTaskId) ?? null;
  const rail = selectedTask
    ? {
        label: "Subtasks",
        activeId: selectedSubtaskId,
        items: selectedTask.subtasks.map((subtask) => ({
          id: subtask.id,
          title: subtask.name,
          subtitle: "Subtask",
          description: subtask.metadata,
          accent: "#7dd3fc",
          meta: `${subtask.progress}%`,
        })),
        onSelect: selectSubtask,
      }
    : selectedObjective
      ? {
          label: "Tasks",
          activeId: selectedTaskId,
          items: selectedObjective.tasks.map((task) => ({
            id: task.id,
            title: task.name,
            subtitle: task.state.replace("_", " "),
            description: task.summary,
            accent:
              task.state === "blocked"
                ? "#fb7185"
                : task.state === "done"
                  ? "#86efac"
                  : task.state === "in_progress"
                    ? "#9dd6ff"
                    : "#7c93b5",
            meta: `${task.progress}%`,
          })),
          onSelect: selectTask,
        }
      : selectedGalaxy
        ? {
            label: "Objectives",
            activeId: selectedObjectiveId,
            items: selectedGalaxy.objectives.map((objective) => ({
              id: objective.id,
              title: objective.name,
              subtitle: "Objective",
              description: objective.description,
              accent: selectedGalaxy.color,
              meta: `${objective.progress}%`,
            })),
            onSelect: selectObjective,
          }
        : {
            label: "Galaxies",
            activeId: selectedGalaxyId,
            items: universe.galaxies.map((galaxy) => ({
              id: galaxy.id,
              title: galaxy.name,
              subtitle: galaxy.category,
              description: galaxy.description,
              accent: galaxy.color,
              meta: `${galaxy.progress}%`,
            })),
            onSelect: selectGalaxy,
          };

  const is2D = presentation === "2d";
  const effectiveNavCollapsed = navCollapsed;
  const effectiveMobileSheetState = compactTouch
    ? mobileSheetState === "full"
      ? "full"
      : "half"
    : mobileSheetState;

  function resolveSheetState(offsetY: number) {
    if (compactTouch) {
      return offsetY < -56 ? "full" : "half";
    }

    if (offsetY < -72) {
      return "full";
    }

    if (offsetY > 72) {
      return "peek";
    }

    return "half";
  }

  if (is2D) {
    const panelTabs = [
      { id: "navigate", label: "Navigate", icon: Compass },
      { id: "detail", label: "Detail", icon: Target },
      { id: "habits", label: "Habits", icon: Waves },
      { id: "manage", label: "Manage", icon: Settings2 },
    ] as const;
    const hierarchy = [
      selectedGalaxy?.name ?? null,
      selectedObjective?.name ?? null,
      selectedTask?.name ?? null,
      selectedTask?.subtasks.find((item) => item.id === selectedSubtaskId)?.name ?? null,
    ].filter((item): item is string => Boolean(item));

  const mobileSheetHeight =
      effectiveMobileSheetState === "peek"
        ? "max-h-[164px]"
        : effectiveMobileSheetState === "half"
          ? "max-h-[68svh] md:max-h-[68vh]"
          : "max-h-[calc(100svh-24px)] max-h-[calc(100dvh-24px)] md:max-h-none";
    const sidebarSurfaceClass = compactTouch
      ? "border-white/8 bg-slate-950/92 shadow-[0_18px_64px_rgba(2,6,23,0.24)]"
      : "border-white/10 bg-slate-950/58 shadow-[0_24px_120px_rgba(2,6,23,0.36)] backdrop-blur-2xl";
    const cardSurfaceClass = compactTouch
      ? "border-white/8 bg-slate-950/72 shadow-[0_12px_40px_rgba(2,6,23,0.18)]"
      : "border-white/10 bg-slate-950/34 shadow-[0_18px_80px_rgba(2,6,23,0.2)] backdrop-blur-2xl";
    const navButtonClass = compactTouch
      ? "inline-flex items-center gap-8 rounded-full border border-white/10 bg-slate-900 px-12 py-8 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-100 transition active:scale-[0.99]"
      : "inline-flex items-center gap-8 rounded-full border border-white/10 bg-white/[0.04] px-12 py-8 text-xs font-medium uppercase tracking-[0.14em] text-slate-200 transition hover:bg-white/[0.08]";

    return (
      <div className="pointer-events-none absolute inset-0 z-20">
        <TaskFocusModal
          key={`${selectedTaskId ?? "task"}:${selectedSubtaskId ?? "subtask"}`}
          workspace={workspace}
          selectedGalaxyId={selectedGalaxyId}
          selectedObjectiveId={selectedObjectiveId}
          selectedTaskId={selectedTaskId}
          selectedSubtaskId={selectedSubtaskId}
          onRefreshData={onRefreshData}
        />
        <AnimatePresence initial={false}>
          {!effectiveNavCollapsed ? (
            <motion.aside
              key="sidebar-open"
              className={`pointer-events-auto absolute inset-x-4 bottom-4 top-auto z-30 flex overflow-hidden rounded-[24px] border transition-none md:transition-[max-height] md:duration-300 md:inset-y-12 md:left-12 md:right-auto md:w-[380px] md:max-w-[calc(100vw-48px)] md:max-h-none md:rounded-[28px] ${sidebarSurfaceClass} ${mobileSheetHeight}`}
              initial={compactTouch ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={compactTouch ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={compactTouch ? { duration: 0 } : { duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              drag={compactTouch ? false : "y"}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.08}
              dragMomentum={false}
              onDragEnd={(_event, info) => {
                if (window.innerWidth >= 768) {
                  return;
                }

                setMobileSheetState(resolveSheetState(info.offset.y));
              }}
            >
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="border-b border-white/8 p-12 md:p-16">
                  <div className="mb-10 flex items-center justify-between gap-12 md:hidden">
                    <button
                      type="button"
                      onClick={() =>
                        setMobileSheetState((state) =>
                          compactTouch
                            ? state === "full"
                              ? "half"
                              : "full"
                            : state === "peek"
                              ? "half"
                              : state === "half"
                                ? "full"
                                : "peek",
                        )
                      }
                      className="mx-auto inline-flex items-center gap-8 rounded-full border border-white/10 bg-white/[0.04] px-12 py-6 text-[10px] uppercase tracking-[0.16em] text-slate-300"
                      aria-label="Cycle bottom sheet size"
                    >
                      <span className="h-1.5 w-12 rounded-full bg-white/18" />
                      <span>{effectiveMobileSheetState}</span>
                    </button>
                  </div>
                  <div className="flex items-start justify-between gap-12">
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                        Spatial navigator
                      </p>
                      <h2 className="mt-8 text-[22px] leading-[1.02] font-semibold tracking-[-0.05em] text-white">
                        {universe.title}
                      </h2>
                      <p className="mt-8 text-sm leading-[1.6] text-slate-300">
                        {compactTouch
                          ? "Navigation, context, and actions stay here without covering the whole canvas."
                          : "Canvas navigation, context, and actions live here in a single scrollable rail."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNavCollapsed(true)}
                      className={navButtonClass}
                      aria-label="Collapse navigation sidebar"
                    >
                      <ChevronsLeft className="size-16" aria-hidden="true" />
                      <span>Close</span>
                    </button>
                  </div>

                  <div className={`mt-12 flex flex-wrap gap-8 ${effectiveMobileSheetState === "peek" ? "hidden md:flex" : ""}`}>
                    <button
                      type="button"
                      onClick={zoomToMap}
                      className="inline-flex items-center gap-8 rounded-full border border-white/10 bg-slate-950/56 px-12 py-8 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-200 transition hover:bg-slate-950/72"
                      aria-label="Zoom out to universe map"
                    >
                      <Map className="size-16" aria-hidden="true" />
                      <span>Universe map</span>
                    </button>
                    <button
                      type="button"
                      onClick={stepOut}
                      disabled={!canStepOut}
                      className="inline-flex items-center gap-8 rounded-full border border-white/10 bg-slate-950/56 px-12 py-8 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-200 transition hover:bg-slate-950/72 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Step out one level"
                    >
                      <ArrowUp className="size-16" aria-hidden="true" />
                      <span>Step out</span>
                    </button>
                  </div>

                  <div className={`mt-12 flex flex-wrap gap-8 ${effectiveMobileSheetState === "peek" ? "hidden md:flex" : ""}`}>
                    <span className="rounded-full border border-sky-300/16 bg-sky-400/10 px-10 py-6 text-[10px] uppercase tracking-[0.18em] text-sky-100">
                      {rail.label}
                    </span>
                    {hierarchy.length === 0 ? (
                      <span className="rounded-full border border-white/8 bg-white/[0.03] px-10 py-6 text-[10px] uppercase tracking-[0.18em] text-slate-400">
                        Universe overview
                      </span>
                    ) : (
                      hierarchy.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-white/8 bg-white/[0.03] px-10 py-6 text-[10px] uppercase tracking-[0.18em] text-slate-300"
                        >
                          {item}
                        </span>
                      ))
                    )}
                  </div>

                  <div className={`mt-12 grid grid-cols-2 gap-8 rounded-[18px] border border-white/8 bg-white/[0.03] p-8 md:grid-cols-4 ${effectiveMobileSheetState === "peek" ? "hidden md:grid" : ""}`}>
                    {panelTabs.map((tab) => {
                      const Icon = tab.icon;
                      const active = sidebarPanel === tab.id;

                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setSidebarPanel(tab.id)}
                          className={`inline-flex min-w-0 items-center justify-center gap-6 rounded-[14px] px-10 py-10 text-[10px] font-medium uppercase tracking-[0.16em] transition ${
                            active
                              ? "bg-white text-slate-950 shadow-[0_12px_40px_rgba(255,255,255,0.16)]"
                              : "text-slate-300 hover:bg-white/[0.06]"
                          }`}
                          aria-pressed={active}
                        >
                          <Icon className="size-14" aria-hidden="true" />
                          <span className="truncate">{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {!effectiveNavCollapsed ? (
                    <motion.div
                      key={`nav-content-${sidebarPanel}`}
                      className={`min-h-0 flex-1 overflow-y-auto p-12 ${
                        effectiveMobileSheetState === "peek" && sidebarPanel !== "navigate" ? "hidden md:block" : ""
                      }`}
                      style={{ touchAction: "pan-y" }}
                      initial={compactTouch ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={compactTouch ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                      transition={compactTouch ? { duration: 0 } : { duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="grid gap-8">
                        {sidebarPanel === "navigate" ? (
                          <>
                            <motion.div
                              className={`w-full rounded-[20px] border p-12 ${cardSurfaceClass}`}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            >
                              <div className="flex items-start justify-between gap-12">
                                <div className="min-w-0">
                                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                                    Navigation mode
                                  </p>
                                  <h3 className="mt-8 text-lg font-semibold tracking-[-0.04em] text-white">
                                    {rail.label}
                                  </h3>
                                </div>
                                <div className="rounded-full border border-white/8 bg-white/[0.03] px-10 py-6 text-[10px] uppercase tracking-[0.16em] text-slate-300">
                                  {rail.items.length} items
                                </div>
                              </div>
                              <p className="mt-10 text-sm leading-[1.6] text-slate-300">
                                {compactTouch
                                  ? "Browse this level here, then tap nodes on the canvas to go deeper."
                                  : "Navigate laterally here, then click nodes in the canvas to drill deeper with context preserved."}
                              </p>
                              <div className="mt-12 grid grid-cols-2 gap-8">
                                <button
                                  type="button"
                                  onClick={() => stepSelection("prev", universe)}
                                  className="inline-flex items-center justify-center gap-8 rounded-[16px] border border-white/10 bg-white/[0.03] px-12 py-10 text-xs uppercase tracking-[0.14em] text-slate-200 transition hover:bg-white/[0.06]"
                                  aria-label="Previous item"
                                >
                                  <ArrowLeft className="size-16" aria-hidden="true" />
                                  Prev
                                </button>
                                <button
                                  type="button"
                                  onClick={() => stepSelection("next", universe)}
                                  className="inline-flex items-center justify-center gap-8 rounded-[16px] border border-white/10 bg-white/[0.03] px-12 py-10 text-xs uppercase tracking-[0.14em] text-slate-200 transition hover:bg-white/[0.06]"
                                  aria-label="Next item"
                                >
                                  Next
                                  <ArrowRight className="size-16" aria-hidden="true" />
                                </button>
                              </div>
                            </motion.div>

                            <motion.div
                              key={`${rail.label}:${rail.activeId ?? "none"}`}
                              initial={{ opacity: 0, y: 10, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -8, scale: 0.98 }}
                              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                            >
                              <GalaxyRail
                                label={rail.label}
                                items={rail.items}
                                activeId={rail.activeId}
                                onSelect={rail.onSelect}
                                condensed={false}
                              />
                            </motion.div>

                            {!introHidden ? (
                              <motion.div
                                className={`w-full rounded-[20px] border p-12 ${cardSurfaceClass} ${
                                  effectiveMobileSheetState === "peek" ? "hidden md:block" : ""
                                }`}
                                initial={compactTouch ? false : { opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={compactTouch ? { duration: 0 } : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                              >
                                <div className="flex flex-wrap items-center gap-12">
                                  <div className="flex size-32 items-center justify-center rounded-full border border-white/10 bg-white/8 text-white">
                                    <Map className="size-14" aria-hidden="true" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                                      Universe map
                                    </p>
                                    <h1 className="mt-8 text-xl leading-[1.02] font-semibold tracking-[-0.05em] text-white">
                                      {universe.title}
                                    </h1>
                                  </div>
                                </div>
                                <p className="mt-12 text-sm leading-[1.6] text-slate-300">
                                  {universe.summary}
                                </p>
                                <div className="mt-12 grid gap-8">
                                  <HudStat label="Completion" value={universe.stats.completion} />
                                  <HudStat label="Focus" value={universe.stats.focus} />
                                  <HudStat label="Systems" value={universe.stats.liveSystems} />
                                </div>
                              </motion.div>
                            ) : null}
                          </>
                        ) : null}

                        {sidebarPanel === "detail" ? (
                          <FocusPanel
                            universe={universe}
                            workspace={workspace}
                            selectedGalaxyId={selectedGalaxyId}
                            selectedObjectiveId={selectedObjectiveId}
                            selectedTaskId={selectedTaskId}
                            selectedSubtaskId={selectedSubtaskId}
                            onRefreshData={onRefreshData}
                          />
                        ) : null}

                        {sidebarPanel === "habits" ? (
                          <HabitsPanel
                            workspace={workspace}
                            selectedGalaxyId={selectedGalaxyId}
                            selectedObjectiveId={selectedObjectiveId}
                            onRefreshData={onRefreshData}
                          />
                        ) : null}

                        {sidebarPanel === "manage" ? (
                          <ManagementPanel
                            universe={universe}
                            workspace={workspace}
                            selectedGalaxyId={selectedGalaxyId}
                            selectedObjectiveId={selectedObjectiveId}
                            selectedTaskId={selectedTaskId}
                            selectedSubtaskId={selectedSubtaskId}
                            onRefreshData={onRefreshData}
                          />
                        ) : null}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
                <div className="border-t border-white/8 px-12 py-10 md:hidden">
                  <div className="flex items-center justify-between gap-12">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                        Current level
                      </p>
                      <p className="mt-4 text-sm text-white">{rail.label}</p>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/[0.04] px-10 py-6 text-[10px] uppercase tracking-[0.16em] text-slate-300">
                      {hierarchy[hierarchy.length - 1] ?? "Overview"}
                    </div>
                  </div>
                </div>
              </div>
            </motion.aside>
          ) : (
            <motion.div
              key="sidebar-closed"
              data-universe-ui="true"
              className="pointer-events-auto absolute bottom-4 left-4 right-4 z-40 md:left-12 md:right-auto md:top-12 md:bottom-auto"
              initial={compactTouch ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={compactTouch ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              transition={compactTouch ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex flex-col gap-8 rounded-[22px] border border-white/10 bg-slate-950/88 p-8 shadow-[0_18px_60px_rgba(2,6,23,0.28)] md:inline-flex md:flex-row md:items-center md:rounded-full md:bg-slate-950/72 md:p-0 md:shadow-[0_18px_60px_rgba(2,6,23,0.32)]">
                <div className="min-w-0 flex-1 rounded-[16px] border border-white/8 bg-white/[0.03] px-12 py-10 md:hidden">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    Current level
                  </p>
                  <p className="mt-4 truncate text-sm text-white">{rail.label}</p>
                </div>
                <button
                  type="button"
                  data-universe-ui="true"
                  onClick={() => {
                    setNavCollapsed(false);
                    if (compactTouch) {
                      setMobileSheetState("half");
                    }
                  }}
                  className="inline-flex w-full shrink-0 items-center justify-center gap-8 rounded-[16px] border border-white/10 bg-slate-900 px-12 py-12 text-xs font-medium uppercase tracking-[0.16em] text-slate-100 transition active:scale-[0.99] md:w-auto md:rounded-full md:bg-transparent md:px-12 md:py-10"
                  aria-label="Open navigation sidebar"
                >
                  <ChevronsRight className="size-16" aria-hidden="true" />
                  <span>Open nav</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pointer-events-none absolute bottom-12 left-8 hidden rounded-full border border-white/10 bg-slate-950/48 px-16 py-8 text-xs text-slate-300 backdrop-blur-xl lg:flex lg:items-center lg:gap-8 md:left-12">
          <Sparkles className="size-16 text-violet-300" aria-hidden="true" />
          The 2D lab keeps the same hierarchy with a flatter, more legible navigation surface.
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-8 pb-20 md:p-16">
      <div className="flex flex-col items-start gap-8 xl:max-w-[420px]">
        <div className="pointer-events-auto flex max-w-full gap-8 overflow-x-auto pb-2 md:flex-wrap md:overflow-visible">
          <button
            type="button"
            onClick={zoomToMap}
            className="inline-flex shrink-0 items-center gap-8 rounded-full border border-white/10 bg-slate-950/56 px-12 py-8 text-xs font-medium uppercase tracking-[0.14em] text-slate-200 backdrop-blur-xl transition hover:bg-slate-950/72"
            aria-label="Zoom out to universe map"
          >
            <Map className="size-16" aria-hidden="true" />
            <span>Universe map</span>
          </button>
          <button
            type="button"
            onClick={stepOut}
            disabled={!canStepOut}
            className="inline-flex shrink-0 items-center gap-8 rounded-full border border-white/10 bg-slate-950/56 px-12 py-8 text-xs font-medium uppercase tracking-[0.14em] text-slate-200 backdrop-blur-xl transition hover:bg-slate-950/72 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Step out one level"
          >
            <ArrowUp className="size-16" aria-hidden="true" />
            <span>Step out</span>
          </button>
          <button
            type="button"
            onClick={() => setIntroHidden((value) => !value)}
            className="inline-flex shrink-0 items-center gap-8 rounded-full border border-white/10 bg-slate-950/56 px-12 py-8 text-xs font-medium uppercase tracking-[0.14em] text-slate-200 backdrop-blur-xl transition hover:bg-slate-950/72"
            aria-pressed={introHidden}
            aria-label={introHidden ? "Show overview panel" : "Hide overview panel"}
          >
            {introHidden ? (
              <Eye className="size-16" aria-hidden="true" />
            ) : (
              <EyeOff className="size-16" aria-hidden="true" />
            )}
            <span>{introHidden ? "Show overview" : "Hide overview"}</span>
          </button>
          <button
            type="button"
            onClick={() => setDetailHidden((value) => !value)}
            className="inline-flex shrink-0 items-center gap-8 rounded-full border border-white/10 bg-slate-950/56 px-12 py-8 text-xs font-medium uppercase tracking-[0.14em] text-slate-200 backdrop-blur-xl transition hover:bg-slate-950/72"
            aria-pressed={detailHidden}
            aria-label={detailHidden ? "Show detail panel" : "Hide detail panel"}
          >
            {detailHidden ? (
              <Eye className="size-16" aria-hidden="true" />
            ) : (
              <EyeOff className="size-16" aria-hidden="true" />
            )}
            <span>{detailHidden ? "Show detail" : "Hide detail"}</span>
          </button>
          <button
            type="button"
            onClick={() => setManageHidden((value) => !value)}
            className="inline-flex shrink-0 items-center gap-8 rounded-full border border-white/10 bg-slate-950/56 px-12 py-8 text-xs font-medium uppercase tracking-[0.14em] text-slate-200 backdrop-blur-xl transition hover:bg-slate-950/72"
            aria-pressed={manageHidden}
            aria-label={manageHidden ? "Show management panel" : "Hide management panel"}
          >
            {manageHidden ? (
              <Eye className="size-16" aria-hidden="true" />
            ) : (
              <EyeOff className="size-16" aria-hidden="true" />
            )}
            <span>{manageHidden ? "Show CRUD" : "Hide CRUD"}</span>
          </button>
          <button
            type="button"
            onClick={() => setHabitsHidden((value) => !value)}
            className="inline-flex shrink-0 items-center gap-8 rounded-full border border-white/10 bg-slate-950/56 px-12 py-8 text-xs font-medium uppercase tracking-[0.14em] text-slate-200 backdrop-blur-xl transition hover:bg-slate-950/72"
            aria-pressed={habitsHidden}
            aria-label={habitsHidden ? "Show habits panel" : "Hide habits panel"}
          >
            {habitsHidden ? (
              <Eye className="size-16" aria-hidden="true" />
            ) : (
              <EyeOff className="size-16" aria-hidden="true" />
            )}
            <span>{habitsHidden ? "Show habits" : "Hide habits"}</span>
          </button>
          {presentation === "3d" ? (
            <button
              type="button"
              onClick={() =>
                setInteractionMode(interactionMode === "guided" ? "explore" : "guided")
              }
              className="inline-flex shrink-0 items-center gap-8 rounded-full border border-white/10 bg-slate-950/56 px-12 py-8 text-xs font-medium uppercase tracking-[0.14em] text-slate-200 backdrop-blur-xl transition hover:bg-slate-950/72"
              aria-pressed={interactionMode === "explore"}
              aria-label={
                interactionMode === "guided"
                  ? "Switch to explore mode"
                  : "Switch to guided mode"
              }
            >
              <Orbit className="size-16" aria-hidden="true" />
              <span>{interactionMode === "guided" ? "Guided swipe" : "Explore drag"}</span>
            </button>
          ) : null}
        </div>
        <div className="pointer-events-auto flex items-center gap-8 md:hidden">
          <button
            type="button"
            onClick={() => stepSelection("prev", universe)}
            className="inline-flex items-center gap-8 rounded-full border border-white/10 bg-slate-950/56 px-12 py-8 text-xs text-slate-200 backdrop-blur-xl"
            aria-label="Previous item"
          >
            <ArrowLeft className="size-16" aria-hidden="true" />
            Prev
          </button>
          <button
            type="button"
            onClick={() => stepSelection("next", universe)}
            className="inline-flex items-center gap-8 rounded-full border border-white/10 bg-slate-950/56 px-12 py-8 text-xs text-slate-200 backdrop-blur-xl"
            aria-label="Next item"
          >
            Next
            <ArrowRight className="size-16" aria-hidden="true" />
          </button>
        </div>

        {!introHidden ? (
          <motion.div
            className="pointer-events-auto w-full max-w-[360px] rounded-[20px] border border-white/10 bg-slate-950/34 p-12 shadow-[0_18px_80px_rgba(2,6,23,0.2)] backdrop-blur-2xl"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex flex-wrap items-center gap-12">
              <div className="flex size-32 items-center justify-center rounded-full border border-white/10 bg-white/8 text-white">
                <Orbit className="size-14" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                  Spatial productivity system
                </p>
                <h1 className="mt-8 text-xl leading-[1.02] font-semibold tracking-[-0.05em] text-white md:text-2xl">
                  {universe.title}
                </h1>
              </div>
            </div>
            <p className="mt-12 max-w-2xl text-sm leading-[1.6] text-slate-300">
              {universe.summary}
            </p>
            <div className="mt-12 grid gap-8">
              <HudStat label="Completion" value={universe.stats.completion} />
              <HudStat label="Focus" value={universe.stats.focus} />
              <HudStat label="Systems" value={universe.stats.liveSystems} />
            </div>
          </motion.div>
        ) : null}

        {!selectedGalaxyId ? (
          <motion.div
            className="pointer-events-auto hidden items-center gap-12 self-start rounded-[20px] border border-white/10 bg-slate-950/44 px-12 py-10 text-sm text-slate-200 backdrop-blur-xl lg:flex"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: 0.04 }}
          >
            <Compass className="size-16 text-sky-300" aria-hidden="true" />
            <span>Select a galaxy from the map or the rail to enter that system.</span>
          </motion.div>
        ) : null}
        <div className="pointer-events-auto rounded-[16px] border border-white/10 bg-slate-950/40 px-12 py-8 text-xs text-slate-300 backdrop-blur-xl md:hidden">
          {interactionMode === "guided"
            ? "Swipe horizontally on space to move across the current level."
            : "Drag on space to freely explore the scene."}
        </div>
      </div>

      <div className={is2D ? "flex max-w-[420px] flex-col items-stretch gap-8" : "flex flex-col items-stretch gap-8 xl:flex-row xl:items-end xl:justify-end xl:gap-12"}>
        <div className={is2D ? "grid w-full gap-8" : "grid w-full gap-8 xl:max-w-[460px] xl:gap-12"}>
          {!detailHidden ? (
            <div className="pointer-events-auto w-full">
              <FocusPanel
                universe={universe}
                workspace={workspace}
                selectedGalaxyId={selectedGalaxyId}
                selectedObjectiveId={selectedObjectiveId}
                selectedTaskId={selectedTaskId}
                selectedSubtaskId={selectedSubtaskId}
                onRefreshData={onRefreshData}
              />
            </div>
          ) : null}
          <div className="pointer-events-auto w-full md:max-w-[460px]">
            <GalaxyRail
              label={rail.label}
              items={rail.items}
              activeId={rail.activeId}
              onSelect={rail.onSelect}
            />
          </div>
        </div>
        <div className={is2D ? "flex w-full flex-col gap-8" : "flex w-full flex-col gap-8 xl:w-auto"}>
          {!habitsHidden ? (
            <div className="pointer-events-auto w-full">
              <HabitsPanel
                workspace={workspace}
                selectedGalaxyId={selectedGalaxyId}
                selectedObjectiveId={selectedObjectiveId}
                onRefreshData={onRefreshData}
              />
            </div>
          ) : null}
          {!manageHidden ? (
            <div className="pointer-events-auto w-full">
              <ManagementPanel
                universe={universe}
                workspace={workspace}
                selectedGalaxyId={selectedGalaxyId}
                selectedObjectiveId={selectedObjectiveId}
                selectedTaskId={selectedTaskId}
                selectedSubtaskId={selectedSubtaskId}
                onRefreshData={onRefreshData}
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className={`pointer-events-none absolute hidden rounded-full border border-white/10 bg-slate-950/48 px-16 py-8 text-xs text-slate-300 backdrop-blur-xl lg:flex lg:items-center lg:gap-8 ${is2D ? "bottom-12 left-16" : "bottom-12 left-1/2 -translate-x-1/2"}`}>
        <Sparkles className="size-16 text-violet-300" aria-hidden="true" />
        Smooth camera transitions preserve context while the universe keeps moving.
      </div>
    </div>
  );
}

function HudStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-white/8 bg-white/[0.03] p-8">
      <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-8 text-sm font-medium text-white">{value}</p>
    </div>
  );
}
