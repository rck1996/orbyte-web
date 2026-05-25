"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { Compass, Minus, Plus } from "lucide-react";

import { HabitFocusModal } from "@/components/overlays/habit-focus-modal";
import { stateVisuals } from "@/lib/space";
import { useUniverseStore } from "@/store/universe-store";
import type { HabitNode, ObjectiveNode, TaskNode, UniverseData } from "@/types/universe";

const BOARD_WIDTH = 1600;
const BOARD_HEIGHT = 1020;
const CENTER_X = BOARD_WIDTH / 2;
const CENTER_Y = BOARD_HEIGHT / 2;

type Point = {
  x: number;
  y: number;
};

type TransitionOrigin = {
  x: number;
  y: number;
  color: string;
  label: string;
  point: Point;
  beamLength: number;
  beamAngle: number;
};

const premiumEase = [0.22, 1, 0.36, 1] as const;

const sectionVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.32,
      ease: premiumEase,
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
};

export function UniverseMap2D({
  universe,
  transitionPulse = 0,
  workspace,
  onRefreshData,
  performanceMode = false,
}: {
  universe: UniverseData;
  transitionPulse?: number;
  workspace: import("@/types/domain").WorkspaceDomain;
  onRefreshData: () => Promise<void>;
  performanceMode?: boolean;
}) {
  const selectedGalaxyId = useUniverseStore((state) => state.selectedGalaxyId);
  const selectedObjectiveId = useUniverseStore((state) => state.selectedObjectiveId);
  const selectedTaskId = useUniverseStore((state) => state.selectedTaskId);
  const selectedSubtaskId = useUniverseStore((state) => state.selectedSubtaskId);
  const dragOffset = useUniverseStore((state) => state.dragOffset);
  const panBy = useUniverseStore((state) => state.panBy);
  const setPan = useUniverseStore((state) => state.setPan);
  const selectGalaxy = useUniverseStore((state) => state.selectGalaxy);
  const selectObjective = useUniverseStore((state) => state.selectObjective);
  const selectTask = useUniverseStore((state) => state.selectTask);
  const selectSubtask = useUniverseStore((state) => state.selectSubtask);
  const [zoom, setZoom] = useState(1);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [transitionOrigin, setTransitionOrigin] = useState<TransitionOrigin | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [panMotionMode, setPanMotionMode] = useState<"spring" | "direct">("spring");

  const dragging = useRef(false);
  const lastPoint = useRef<Point | null>(null);
  const activePointerId = useRef<number | null>(null);
  const spacePanning = useRef(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const transitionTimers = useRef<number[]>([]);
  const transitionLocked = useRef(false);
  const dragOffsetRef = useRef(dragOffset);
  const panModeTimer = useRef<number | null>(null);

  const galaxy = universe.galaxies.find((item) => item.id === selectedGalaxyId) ?? null;
  const objective =
    galaxy?.objectives.find((item) => item.id === selectedObjectiveId) ?? null;
  const task = objective?.tasks.find((item) => item.id === selectedTaskId) ?? null;
  const sceneCenter = useMemo(
    () => ({
      x: CENTER_X,
      y: CENTER_Y,
    }),
    [],
  );
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const update = () => {
      setViewportSize({
        width: viewport.clientWidth,
        height: viewport.clientHeight,
      });
    };

    update();
    window.addEventListener("resize", update);

    return () => window.removeEventListener("resize", update);
  }, []);

  const galaxyPoints = useMemo(
    () => layoutGalaxies(universe.galaxies.length, sceneCenter),
    [sceneCenter, universe.galaxies.length],
  );
  const objectivePoints = useMemo(
    () => layoutRing(Math.max(galaxy?.objectives.length ?? 0, 1), 280, sceneCenter),
    [galaxy?.objectives.length, sceneCenter],
  );
  const taskPoints = useMemo(
    () => layoutRing(Math.max(objective?.tasks.length ?? 0, 1), 276, sceneCenter),
    [objective?.tasks.length, sceneCenter],
  );
  const subtaskPoints = useMemo(
    () =>
      layoutRing(Math.max(task?.subtasks.length ?? 0, 1), 178, {
        x: sceneCenter.x + 240,
        y: sceneCenter.y,
      }),
    [sceneCenter, task?.subtasks.length],
  );
  const habitPoints = useMemo(
    () => layoutRing(Math.max(objective?.habits?.length ?? 0, 1), 148, sceneCenter),
    [objective?.habits?.length, sceneCenter],
  );
  const taskHabitPoints = useMemo(
    () =>
      layoutRing(Math.max(objective?.habits?.length ?? 0, 1), 148, {
        x: sceneCenter.x - 260,
        y: sceneCenter.y,
      }),
    [objective?.habits?.length, sceneCenter],
  );
  const reducedSceneMotion = prefersReducedMotion || performanceMode;
  const stars = useMemo(
    () => buildStars(reducedSceneMotion ? 24 : 96),
    [reducedSceneMotion],
  );

  const showOverview = !galaxy;
  const showGalaxyView = galaxy && !objective;
  const showObjectiveView = objective && !task;
  const showTaskView = objective && task;
  const minimapPoints = useMemo(() => {
    if (showOverview) {
      return [sceneCenter, ...galaxyPoints];
    }

    if (showGalaxyView && galaxy) {
      return [sceneCenter, ...objectivePoints];
    }

    if (showObjectiveView && objective) {
      return [sceneCenter, ...habitPoints, ...taskPoints];
    }

    if (showTaskView && objective && task) {
      return [
        { x: sceneCenter.x - 260, y: sceneCenter.y },
        { x: sceneCenter.x + 240, y: sceneCenter.y },
        ...taskHabitPoints,
        ...subtaskPoints,
      ];
    }

    return [sceneCenter];
  }, [
    galaxy,
    galaxyPoints,
    habitPoints,
    objective,
    objectivePoints,
    sceneCenter,
    showGalaxyView,
    showObjectiveView,
    showOverview,
    showTaskView,
    subtaskPoints,
    task,
    taskHabitPoints,
    taskPoints,
  ]);
  const fitViewLabel = showOverview
    ? "Fit map"
    : showGalaxyView
      ? "Fit galaxy"
      : showObjectiveView
        ? "Fit system"
        : "Fit task";
  const breadcrumb = buildBreadcrumb({
    universeTitle: universe.title,
    galaxyName: galaxy?.name ?? null,
    objectiveName: objective?.name ?? null,
    taskName: task?.name ?? null,
    subtaskName:
      task?.subtasks.find((item) => item.id === selectedSubtaskId)?.name ?? null,
  });
  const selectedHabit =
    objective?.habits?.find((item) => item.id === selectedHabitId) ?? null;
  const selectedHabitDomain =
    workspace.habits.find((item) => item.id === selectedHabit?.id) ?? null;

  useEffect(() => {
    dragOffsetRef.current = dragOffset;
  }, [dragOffset]);

  useEffect(() => {
    return () => {
      transitionTimers.current.forEach((timer) => window.clearTimeout(timer));
      if (panModeTimer.current) {
        window.clearTimeout(panModeTimer.current);
      }
    };
  }, []);

  const minimapFrame = useMemo(() => {
    if (viewportSize.width <= 0 || viewportSize.height <= 0) {
      return null;
    }

    return {
      left: `${clamp((((CENTER_X - dragOffset.x / zoom) - BOARD_WIDTH / (2 * zoom)) / BOARD_WIDTH) * 100, 0, 100)}%`,
      top: `${clamp((((CENTER_Y - dragOffset.y / zoom) - BOARD_HEIGHT / (2 * zoom)) / BOARD_HEIGHT) * 100, 0, 100)}%`,
      width: `${clamp((viewportSize.width / zoom / BOARD_WIDTH) * 100, 12, 100)}%`,
      height: `${clamp((viewportSize.height / zoom / BOARD_HEIGHT) * 100, 14, 100)}%`,
    };
  }, [dragOffset.x, dragOffset.y, viewportSize.height, viewportSize.width, zoom]);

  function adjustZoom(delta: number) {
    setZoom((current) => clamp(current + delta, 0.68, 1.55));
  }

  function activateDirectPanMotion() {
    setPanMotionMode("direct");
    if (panModeTimer.current) {
      window.clearTimeout(panModeTimer.current);
    }
    panModeTimer.current = window.setTimeout(() => {
      setPanMotionMode("spring");
      panModeTimer.current = null;
    }, 140);
  }

  const getVisibleBounds = useCallback(() => {
    if (showOverview) {
      return boundsFromPoints([sceneCenter, ...galaxyPoints], 180);
    }

    if (showGalaxyView && galaxy) {
      return boundsFromPoints([sceneCenter, ...objectivePoints], 168);
    }

    if (showObjectiveView && objective) {
      return boundsFromPoints([sceneCenter, ...habitPoints, ...taskPoints], 168);
    }

    if (showTaskView && objective && task) {
      return boundsFromPoints(
        [
          { x: sceneCenter.x - 260, y: sceneCenter.y },
          { x: sceneCenter.x + 240, y: sceneCenter.y },
          ...taskHabitPoints,
          ...subtaskPoints,
        ],
        176,
      );
    }

    return boundsFromPoints([sceneCenter], 180);
  }, [
    galaxy,
    galaxyPoints,
    habitPoints,
    objective,
    objectivePoints,
    sceneCenter,
    showGalaxyView,
    showObjectiveView,
    showOverview,
    showTaskView,
    subtaskPoints,
    task,
    taskHabitPoints,
    taskPoints,
  ]);

  const getFitFrame = useCallback(() => {
    const viewport = viewportRef.current;
    const bounds = getVisibleBounds();

    if (!viewport) {
      return {
        zoom: showOverview ? 0.86 : showGalaxyView ? 0.92 : showObjectiveView ? 0.98 : 0.92,
        pan: {
          x: -(bounds.centerX - CENTER_X),
          y: -(bounds.centerY - CENTER_Y),
        },
      };
    }

    const rect = viewport.getBoundingClientRect();
    const availableWidth = Math.max(rect.width - 220, 320);
    const availableHeight = Math.max(rect.height - 220, 320);
    const fitScale = Math.min(
      availableWidth / Math.max(bounds.width, 1),
      availableHeight / Math.max(bounds.height, 1),
    );
    const nextZoom = clamp(fitScale, 0.72, 1.14);

    return {
      zoom: nextZoom,
      pan: {
        x: -(bounds.centerX - CENTER_X) * nextZoom,
        y: -(bounds.centerY - CENTER_Y) * nextZoom,
      },
    };
  }, [getVisibleBounds, showGalaxyView, showObjectiveView, showOverview]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const fitFrame = getFitFrame();
      activateDirectPanMotion();
      setPan(fitFrame.pan.x, fitFrame.pan.y);
      setZoom(fitFrame.zoom);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [
    selectedGalaxyId,
    selectedObjectiveId,
    selectedTaskId,
    selectedSubtaskId,
    getFitFrame,
    setPan,
  ]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTypingTarget =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        Boolean(target?.closest("[contenteditable='true']"));

      if (event.code === "Space") {
        spacePanning.current = true;
      }

      if (isTypingTarget) {
        return;
      }

      if (event.key === "0") {
        event.preventDefault();
        const fitFrame = getFitFrame();
        setTransitionOrigin(null);
        activateDirectPanMotion();
        setPan(fitFrame.pan.x, fitFrame.pan.y);
        setZoom(fitFrame.zoom);
        return;
      }

      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        setZoom((current) => clamp(current + 0.08, 0.68, 1.55));
        return;
      }

      if (event.key === "-") {
        event.preventDefault();
        setZoom((current) => clamp(current - 0.08, 0.68, 1.55));
        return;
      }

      const panStep = event.shiftKey ? 88 : 48;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        activateDirectPanMotion();
        setPan(dragOffsetRef.current.x + panStep, dragOffsetRef.current.y);
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        activateDirectPanMotion();
        setPan(dragOffsetRef.current.x - panStep, dragOffsetRef.current.y);
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        activateDirectPanMotion();
        setPan(dragOffsetRef.current.x, dragOffsetRef.current.y + panStep);
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        activateDirectPanMotion();
        setPan(dragOffsetRef.current.x, dragOffsetRef.current.y - panStep);
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (event.code === "Space") {
        spacePanning.current = false;
      }
    }

    function handleBlur() {
      spacePanning.current = false;
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [getFitFrame, setPan]);

  function zoomAtPoint(clientX: number, clientY: number, delta: number) {
    const viewport = viewportRef.current;

    if (!viewport) {
      adjustZoom(delta);
      return;
    }

    const rect = viewport.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const nextZoom = clamp(zoom + delta, 0.68, 1.55);
    const scaleRatio = nextZoom / zoom;
    const relativeX = clientX - centerX - dragOffset.x;
    const relativeY = clientY - centerY - dragOffset.y;

    setZoom(nextZoom);
    setPan(
      dragOffset.x - relativeX * (scaleRatio - 1),
      dragOffset.y - relativeY * (scaleRatio - 1),
    );
  }

  function resetView() {
    if (transitionLocked.current) {
      return;
    }

    setTransitionOrigin(null);
    const fitFrame = getFitFrame();
    activateDirectPanMotion();
    setPan(fitFrame.pan.x, fitFrame.pan.y);
    setZoom(fitFrame.zoom);
  }

  function recenterFromMinimap(clientX: number, clientY: number, bounds: DOMRect) {
    const localX = clamp((clientX - bounds.left) / bounds.width, 0, 1);
    const localY = clamp((clientY - bounds.top) / bounds.height, 0, 1);
    const boardX = localX * BOARD_WIDTH;
    const boardY = localY * BOARD_HEIGHT;

    activateDirectPanMotion();
    setPan(-(boardX - CENTER_X) * zoom, -(boardY - CENTER_Y) * zoom);
  }

  function beginSelectionTransition({
    point,
    color,
    label,
    nextZoom,
    action,
  }: {
    point: Point;
    color: string;
    label: string;
    nextZoom: number;
    action: () => void;
  }) {
    if (dragging.current || transitionLocked.current) {
      return;
    }

    const viewport = viewportRef.current;

    if (!viewport) {
      action();
      return;
    }

    transitionLocked.current = true;
    transitionTimers.current.forEach((timer) => window.clearTimeout(timer));
    transitionTimers.current = [];

    const rect = viewport.getBoundingClientRect();
    const originX = rect.width / 2 + dragOffset.x + (point.x - CENTER_X) * zoom;
    const originY = rect.height / 2 + dragOffset.y + (point.y - CENTER_Y) * zoom;
    const targetPanX = -(point.x - CENTER_X) * zoom;
    const targetPanY = -(point.y - CENTER_Y) * zoom;
    const beamDx = rect.width / 2 - originX;
    const beamDy = rect.height / 2 - originY;

    setTransitionOrigin({
      x: originX,
      y: originY,
      color,
      label,
      point,
      beamLength: Math.hypot(beamDx, beamDy),
      beamAngle: Math.atan2(beamDy, beamDx),
    });
    setPan(targetPanX, targetPanY);
    setZoom(clamp(Math.max(zoom, nextZoom), 0.72, 1.6));

    transitionTimers.current.push(
      window.setTimeout(() => {
        action();
      }, prefersReducedMotion ? 40 : 150),
    );

    transitionTimers.current.push(
      window.setTimeout(() => {
        setTransitionOrigin(null);
        transitionLocked.current = false;
      }, prefersReducedMotion ? 180 : 620),
    );
  }

  return (
    <div
      ref={viewportRef}
      className="absolute inset-0 overflow-hidden cursor-grab active:cursor-grabbing"
      style={{ touchAction: "none" }}
      onContextMenu={(event) => event.preventDefault()}
      onWheel={(event) => {
        event.preventDefault();
        const delta = event.deltaY > 0 ? -0.08 : 0.08;
        zoomAtPoint(event.clientX, event.clientY, delta);
      }}
      onPointerDown={(event) => {
        dragging.current = false;
        const target = event.target as HTMLElement | null;
        const startedOnNode = Boolean(target?.closest("[data-universe-node='true']"));
        const startedOnUi = Boolean(target?.closest("[data-universe-ui='true']"));
        const isTouch = event.pointerType === "touch";
        const isRightButton = event.button === 2;
        const canPanFromAnywhere = isRightButton || spacePanning.current;
        const shouldStartDrag = isTouch || canPanFromAnywhere || !startedOnNode;

        if (startedOnUi || !shouldStartDrag) {
          lastPoint.current = null;
          activePointerId.current = null;
          return;
        }

        dragging.current = true;
        activePointerId.current = event.pointerId;
        event.currentTarget.setPointerCapture?.(event.pointerId);
        lastPoint.current = { x: event.clientX, y: event.clientY };
      }}
      onPointerMove={(event) => {
        if (!dragging.current || !lastPoint.current) {
          return;
        }

        const deltaX = event.clientX - lastPoint.current.x;
        const deltaY = event.clientY - lastPoint.current.y;
        lastPoint.current = { x: event.clientX, y: event.clientY };
        panBy(deltaX / zoom, deltaY / zoom);
      }}
      onPointerUp={(event) => {
        dragging.current = false;
        if (activePointerId.current === event.pointerId) {
          event.currentTarget.releasePointerCapture?.(event.pointerId);
        }
        activePointerId.current = null;
        lastPoint.current = null;
      }}
      onPointerCancel={(event) => {
        dragging.current = false;
        if (activePointerId.current === event.pointerId) {
          event.currentTarget.releasePointerCapture?.(event.pointerId);
        }
        activePointerId.current = null;
        lastPoint.current = null;
      }}
      onPointerLeave={() => {
        dragging.current = false;
        activePointerId.current = null;
        lastPoint.current = null;
      }}
    >
      <HabitFocusModal
        habit={selectedHabitDomain}
        objectiveName={objective?.name ?? null}
        open={Boolean(selectedHabitDomain)}
        onClose={() => setSelectedHabitId(null)}
        onRefreshData={onRefreshData}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(148,163,184,0.08),transparent_46%),linear-gradient(180deg,rgba(2,6,23,0.24),rgba(2,6,23,0.7))]" />
      <div className={`pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:96px_96px] ${reducedSceneMotion ? "opacity-10" : "opacity-30"}`} />
      <AnimatePresence mode="wait">
        <motion.div
          key={breadcrumb.join(":")}
          className="pointer-events-none absolute left-1/2 top-8 z-20 flex -translate-x-1/2 flex-wrap items-center justify-center gap-8 px-16 md:top-12"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.28, ease: premiumEase }}
        >
          {breadcrumb.map((segment, index) => (
            <div key={`${segment}-${index}`} className="flex items-center gap-8">
              <span className="rounded-full border border-white/10 bg-slate-950/60 px-12 py-8 text-[10px] uppercase tracking-[0.18em] text-slate-200 backdrop-blur-xl">
                {segment}
              </span>
              {index < breadcrumb.length - 1 ? (
                <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">/</span>
              ) : null}
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
      <motion.div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        animate={{
          x: reducedSceneMotion ? dragOffset.x * 0.03 : dragOffset.x * 0.08,
          y: reducedSceneMotion ? dragOffset.y * 0.03 : dragOffset.y * 0.08,
        }}
        transition={
          reducedSceneMotion
            ? { duration: 0.18, ease: "linear" }
            : { x: { type: "spring", stiffness: 70, damping: 24 }, y: { type: "spring", stiffness: 70, damping: 24 } }
        }
      >
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
              boxShadow: `0 0 ${star.glow}px rgba(255,255,255,0.32)`,
            }}
            animate={
              reducedSceneMotion
                ? { opacity: star.opacity, scale: 1 }
                : {
                    opacity: [star.opacity * 0.55, star.opacity, star.opacity * 0.55],
                    scale: [1, 1.18, 1],
                  }
            }
            transition={
              reducedSceneMotion
                ? { duration: 0.18, ease: "linear" }
                : {
                    opacity: {
                      duration: 3 + star.depth * 6,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    },
                    scale: {
                      duration: 3 + star.depth * 5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    },
                  }
            }
          />
        ))}
      </motion.div>
      <AnimatePresence>
        {transitionOrigin && !reducedSceneMotion ? (
          <motion.div
            key={`${transitionOrigin.label}-${transitionPulse}`}
            className="pointer-events-none absolute inset-0 z-[18]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: premiumEase }}
          >
            <motion.div
              className="absolute origin-left rounded-full"
              style={{
                left: transitionOrigin.x,
                top: transitionOrigin.y,
                width: transitionOrigin.beamLength,
                height: 2,
                background: `linear-gradient(90deg, ${transitionOrigin.color}, rgba(255,255,255,0.08))`,
                transform: `translateY(-50%) rotate(${transitionOrigin.beamAngle}rad)`,
                boxShadow: `0 0 18px ${transitionOrigin.color}66`,
              }}
              initial={{ opacity: 0, scaleX: 0.1 }}
              animate={{ opacity: [0, 0.72, 0], scaleX: [0.1, 1, 1.04] }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0.18 : 0.44, ease: premiumEase }}
            />
            <motion.div
              className="absolute rounded-full border"
              style={{
                left: transitionOrigin.x,
                top: transitionOrigin.y,
                borderColor: `${transitionOrigin.color}55`,
              }}
              initial={{ width: 52, height: 52, x: "-50%", y: "-50%", opacity: 0.88, scale: 1 }}
              animate={{
                width: [52, 38, 96],
                height: [52, 38, 96],
                x: "-50%",
                y: "-50%",
                opacity: [0.88, 0.92, 0],
                scale: [1, 0.84, 1.12],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0.22 : 0.4, ease: premiumEase }}
            />
            <motion.div
              className="absolute rounded-full"
              style={{
                left: transitionOrigin.x,
                top: transitionOrigin.y,
                background: `radial-gradient(circle, ${transitionOrigin.color} 0%, rgba(255,255,255,0.18) 34%, transparent 72%)`,
                boxShadow: `0 0 120px ${transitionOrigin.color}44`,
              }}
              initial={{ width: 24, height: 24, x: "-50%", y: "-50%", opacity: 0.94 }}
              animate={{
                width: prefersReducedMotion ? 180 : 520,
                height: prefersReducedMotion ? 180 : 520,
                x: "-50%",
                y: "-50%",
                opacity: [0.92, 0.32, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0.22 : 0.58, ease: premiumEase }}
            />
            <motion.div
              className="absolute rounded-full border border-white/18"
              style={{
                left: transitionOrigin.x,
                top: transitionOrigin.y,
                boxShadow: `0 0 80px ${transitionOrigin.color}33`,
              }}
              initial={{ width: 18, height: 18, x: "-50%", y: "-50%", opacity: 0.8, scale: 1 }}
              animate={{
                width: prefersReducedMotion ? 90 : 240,
                height: prefersReducedMotion ? 90 : 240,
                x: "-50%",
                y: "-50%",
                opacity: [0.7, 0.2, 0],
                scale: [1, 1.1, 1.18],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0.2 : 0.52, ease: premiumEase }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div
        data-universe-ui="true"
        className="pointer-events-auto absolute right-4 top-4 z-20 flex items-center gap-6 rounded-full border border-white/10 bg-slate-950/58 px-6 py-6 shadow-[0_16px_50px_rgba(2,6,23,0.32)] backdrop-blur-xl md:right-12 md:top-12 md:gap-8 md:px-8 md:py-8"
      >
        <button
          type="button"
          onClick={() => adjustZoom(-0.1)}
          className="inline-flex size-28 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-200 transition hover:bg-white/[0.08] md:size-32"
          aria-label="Zoom out"
        >
          <Minus className="size-14" />
        </button>
        <div className="min-w-[56px] text-center text-[10px] uppercase tracking-[0.16em] text-slate-300 md:min-w-[68px] md:text-xs">
          {Math.round(zoom * 100)}%
        </div>
        <button
          type="button"
          onClick={() => adjustZoom(0.1)}
          className="inline-flex size-28 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-200 transition hover:bg-white/[0.08] md:size-32"
          aria-label="Zoom in"
        >
          <Plus className="size-14" />
        </button>
        <button
          type="button"
          onClick={resetView}
          className="inline-flex items-center gap-6 rounded-full border border-white/10 bg-white/[0.04] px-8 py-6 text-[10px] uppercase tracking-[0.14em] text-slate-200 transition hover:bg-white/[0.08] md:px-10 md:py-8 md:text-xs"
          aria-label={`${fitViewLabel} and recenter view`}
        >
          <Compass className="size-14" />
          <span className="hidden md:inline">{fitViewLabel}</span>
          <span className="md:hidden">Fit</span>
        </button>
      </div>
      <div
        data-universe-ui="true"
        className="pointer-events-auto absolute bottom-4 right-4 z-20 hidden w-[172px] rounded-[22px] border border-white/10 bg-slate-950/56 p-10 shadow-[0_20px_60px_rgba(2,6,23,0.34)] backdrop-blur-2xl md:bottom-12 md:right-12 md:block"
      >
        <div className="flex items-center justify-between gap-8">
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Navigator</p>
          <span className="rounded-full border border-white/8 bg-white/[0.03] px-8 py-4 text-[10px] text-slate-400">
            {fitViewLabel}
          </span>
        </div>
        <div
          className="relative mt-10 overflow-hidden rounded-[16px] border border-white/8 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.88),rgba(2,6,23,0.98))]"
          style={{ aspectRatio: `${BOARD_WIDTH} / ${BOARD_HEIGHT}` }}
          onPointerDown={(event) => {
            const bounds = event.currentTarget.getBoundingClientRect();
            recenterFromMinimap(event.clientX, event.clientY, bounds);
          }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:18px_18px] opacity-30" />
          {minimapPoints.map((point, index) => (
            <div
              key={`minimap-point-${index}`}
              className="absolute size-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-200/90 shadow-[0_0_14px_rgba(125,211,252,0.5)]"
              style={{
                left: `${(point.x / BOARD_WIDTH) * 100}%`,
                top: `${(point.y / BOARD_HEIGHT) * 100}%`,
              }}
            />
          ))}
          {minimapFrame ? (
            <motion.div
              className="absolute rounded-[10px] border border-sky-300/60 bg-sky-400/10 shadow-[0_0_20px_rgba(125,211,252,0.22)]"
              style={minimapFrame}
              animate={minimapFrame}
              transition={{ duration: 0.24, ease: premiumEase }}
            />
          ) : null}
        </div>
        <p className="mt-8 text-[10px] leading-[1.5] text-slate-400">
          Tap or click to recenter. The frame shows your current viewport.
        </p>
      </div>

      <LayoutGroup id="orbyte-universe-map">
        <motion.div
          key="board"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: BOARD_WIDTH,
            height: BOARD_HEIGHT,
          }}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{
            opacity: 1,
            scale: zoom,
            x: dragOffset.x,
            y: dragOffset.y,
            filter: transitionOrigin
              ? reducedSceneMotion
                ? "none"
                : "blur(1.6px) saturate(0.84) brightness(0.92)"
              : "blur(0px) saturate(1) brightness(1)",
          }}
          transition={{
            opacity: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
            scale: prefersReducedMotion
              ? { duration: 0.2, ease: "linear" }
              : { type: "spring", stiffness: 120, damping: 24, mass: 0.7 },
            x:
              panMotionMode === "direct"
                ? { duration: 0.12, ease: premiumEase }
                : { type: "spring", stiffness: 120, damping: 24, mass: 0.6 },
            y:
              panMotionMode === "direct"
                ? { duration: 0.12, ease: premiumEase }
                : { type: "spring", stiffness: 120, damping: 24, mass: 0.6 },
            filter: { duration: 0.26, ease: premiumEase },
          }}
        >
        <svg className="pointer-events-none absolute inset-0 h-full w-full">
          {showOverview
            ? universe.galaxies.map((item, index) => (
                <line
                  key={item.id}
                  x1={sceneCenter.x}
                  y1={sceneCenter.y}
                  x2={galaxyPoints[index].x}
                  y2={galaxyPoints[index].y}
                  stroke="rgba(125,211,252,0.14)"
                  strokeWidth="1.5"
                />
              ))
            : null}

          {showGalaxyView && galaxy
            ? galaxy.objectives.map((item, index) => (
                <line
                  key={item.id}
                  x1={sceneCenter.x}
                  y1={sceneCenter.y}
                  x2={objectivePoints[index].x}
                  y2={objectivePoints[index].y}
                  stroke="rgba(248,250,252,0.12)"
                  strokeWidth="1.5"
                />
              ))
            : null}

          {showObjectiveView && objective ? (
            <>
                <circle
                cx={sceneCenter.x}
                cy={sceneCenter.y}
                r="276"
                fill="none"
                stroke="rgba(251,191,36,0.16)"
                strokeWidth="2"
                strokeDasharray="6 10"
              />
              <circle
                cx={sceneCenter.x}
                cy={sceneCenter.y}
                r="148"
                fill="none"
                stroke="rgba(34,211,238,0.16)"
                strokeWidth="2"
                strokeDasharray="4 8"
              />
              {objective.tasks.map((item, index) => (
                <line
                  key={item.id}
                  x1={sceneCenter.x}
                  y1={sceneCenter.y}
                  x2={taskPoints[index].x}
                  y2={taskPoints[index].y}
                  stroke="rgba(248,250,252,0.1)"
                  strokeWidth="1.5"
                />
              ))}
            </>
          ) : null}

          {showTaskView && objective && task ? (
            <>
              <line
                x1={sceneCenter.x - 260}
                y1={sceneCenter.y}
                x2={sceneCenter.x + 180}
                y2={sceneCenter.y}
                stroke="rgba(248,250,252,0.12)"
                strokeWidth="2"
              />
              <circle
                cx={sceneCenter.x - 260}
                cy={sceneCenter.y}
                r="148"
                fill="none"
                stroke="rgba(34,211,238,0.16)"
                strokeWidth="2"
                strokeDasharray="4 8"
              />
              <circle
                cx={sceneCenter.x + 240}
                cy={sceneCenter.y}
                r="178"
                fill="none"
                stroke="rgba(125,211,252,0.18)"
                strokeWidth="2"
                strokeDasharray="6 10"
              />
            </>
          ) : null}
        </svg>

        {showOverview ? (
          <motion.div
            key={`overview-${transitionPulse}`}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            <HubBadge
              title={universe.title}
              subtitle="Galaxy index"
              description="Categories are flattened into a 2D navigation surface to make the whole universe easier to scan."
              point={sceneCenter}
              introOrigin={transitionOrigin?.point ?? null}
            />
            {universe.galaxies.map((item, index) => (
              <GalaxyCard
                key={item.id}
                galaxy={item}
                point={galaxyPoints[index]}
                introOrigin={transitionOrigin?.point ?? null}
                onSelect={() =>
                  beginSelectionTransition({
                    point: galaxyPoints[index],
                    color: item.color,
                    label: item.name,
                    nextZoom: 0.94,
                    action: () => selectGalaxy(item.id),
                  })
                }
              />
            ))}
          </motion.div>
        ) : null}

        {showGalaxyView && galaxy ? (
          <motion.div
            key={`galaxy-${galaxy.id}-${transitionPulse}`}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            <HubBadge
              title={galaxy.name}
              subtitle={galaxy.category}
              description={galaxy.description}
              point={sceneCenter}
              accent={galaxy.accent}
              layoutId={`galaxy-${galaxy.id}`}
              introOrigin={transitionOrigin?.point ?? null}
            />
            <motion.div animate={{ opacity: 0.96 }} transition={{ duration: 0.26, ease: premiumEase }}>
              {galaxy.objectives.map((item, index) => (
                <ObjectiveCard2D
                  key={item.id}
                  objective={item}
                  accent={galaxy.accent}
                  point={objectivePoints[index]}
                  introOrigin={transitionOrigin?.point ?? null}
                  onSelect={() =>
                    beginSelectionTransition({
                      point: objectivePoints[index],
                      color: "#fbbf24",
                      label: item.name,
                      nextZoom: 1,
                      action: () => selectObjective(item.id),
                    })
                  }
                />
              ))}
            </motion.div>
          </motion.div>
        ) : null}

        {showObjectiveView && objective ? (
          <motion.div
            key={`objective-${objective.id}-${transitionPulse}`}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            <ObjectiveSun2D
              objective={objective}
              point={sceneCenter}
              introOrigin={transitionOrigin?.point ?? null}
            />
            <motion.div animate={{ opacity: 0.78 }} transition={{ duration: 0.26, ease: premiumEase }}>
              {(objective.habits ?? []).map((habit, index) => (
                <HabitMarker2D
                  key={habit.id}
                  habit={habit}
                  point={habitPoints[index]}
                  introOrigin={transitionOrigin?.point ?? null}
                  selected={selectedHabitId === habit.id}
                  onSelect={() => setSelectedHabitId(habit.id)}
                />
              ))}
            </motion.div>
            <motion.div animate={{ opacity: 0.96 }} transition={{ duration: 0.26, ease: premiumEase }}>
              {objective.tasks.map((item, index) => (
                <TaskNode2D
                  key={item.id}
                  task={item}
                  point={taskPoints[index]}
                  introOrigin={transitionOrigin?.point ?? null}
                  onSelect={() =>
                    beginSelectionTransition({
                      point: taskPoints[index],
                      color: stateVisuals(item.state).color,
                      label: item.name,
                      nextZoom: 1.08,
                      action: () => selectTask(item.id),
                    })
                  }
                />
              ))}
            </motion.div>
          </motion.div>
        ) : null}

        {showTaskView && objective && task ? (
          <motion.div
            key={`task-${task.id}-${transitionPulse}`}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div animate={{ opacity: 0.7, scale: 0.985 }} transition={{ duration: 0.28, ease: premiumEase }}>
              <ObjectiveSun2D
                objective={objective}
                point={{ x: sceneCenter.x - 260, y: sceneCenter.y }}
                compact
                introOrigin={transitionOrigin?.point ?? null}
              />
              {(objective.habits ?? []).map((habit, index) => (
                <HabitMarker2D
                  key={habit.id}
                  habit={habit}
                  point={taskHabitPoints[index]}
                  introOrigin={transitionOrigin?.point ?? null}
                  selected={selectedHabitId === habit.id}
                  onSelect={() => setSelectedHabitId(habit.id)}
                />
              ))}
            </motion.div>
            <TaskFocus2D
              task={task}
              point={{ x: sceneCenter.x + 240, y: sceneCenter.y }}
              introOrigin={transitionOrigin?.point ?? null}
              onSelect={() => selectTask(task.id)}
            />
            {task.subtasks.map((item, index) => (
              <SubtaskNode2D
                key={item.id}
                subtask={item}
                selected={selectedSubtaskId === item.id}
                point={subtaskPoints[index]}
                introOrigin={transitionOrigin?.point ?? null}
                onSelect={() =>
                  beginSelectionTransition({
                    point: subtaskPoints[index],
                    color: "#dbeafe",
                    label: item.name,
                    nextZoom: 1.12,
                    action: () => selectSubtask(item.id),
                  })
                }
              />
            ))}
          </motion.div>
        ) : null}
        <AnimatePresence>
          {transitionOrigin ? (
            <motion.div
              className="pointer-events-none absolute inset-0 z-[6]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24, ease: premiumEase }}
            >
              <motion.div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(circle at ${transitionOrigin.point.x}px ${transitionOrigin.point.y}px, transparent 0%, transparent 13%, rgba(2,6,23,0.18) 24%, rgba(2,6,23,0.48) 62%, rgba(2,6,23,0.72) 100%)`,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.82] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.42, ease: premiumEase }}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
        </motion.div>
      </LayoutGroup>
    </div>
  );
}

function entranceDelay(point: Point, origin: Point | null, prefersReducedMotion = false) {
  if (!origin || prefersReducedMotion) {
    return 0;
  }

  const distance = Math.hypot(point.x - origin.x, point.y - origin.y);
  return Math.min((distance / 620) * 0.08, 0.14);
}

function boundsFromPoints(points: Point[], padding: number) {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs) - padding;
  const maxX = Math.max(...xs) + padding;
  const minY = Math.min(...ys) - padding;
  const maxY = Math.max(...ys) + padding;

  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function buildStars(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const seed = index * 12.9898;
    const noiseA = Math.abs(Math.sin(seed) * 43758.5453) % 1;
    const noiseB = Math.abs(Math.cos(seed * 0.77) * 24634.6345) % 1;
    const noiseC = Math.abs(Math.sin(seed * 1.37) * 12345.6789) % 1;

    return {
      id: `star-${index}`,
      x: noiseA * 100,
      y: noiseB * 100,
      size: 1 + noiseC * 2.4,
      opacity: 0.18 + noiseA * 0.7,
      glow: 8 + noiseB * 18,
      depth: 0.04 + noiseC * 0.12,
    };
  });
}

function layoutGalaxies(count: number, center: Point): Point[] {
  if (count <= 0) {
    return [];
  }

  const innerCount = Math.min(count, 6);
  const outerCount = Math.max(count - innerCount, 0);
  const inner = layoutRing(innerCount, 286, center, -Math.PI / 2);
  const outer = outerCount
    ? layoutRing(outerCount, 428, center, -Math.PI / 2 + Math.PI / outerCount)
    : [];

  return [...inner, ...outer];
}

function layoutRing(
  count: number,
  radius: number,
  center: Point,
  startAngle = -Math.PI / 2,
): Point[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = startAngle + (index / Math.max(count, 1)) * Math.PI * 2;
    return {
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
    };
  });
}

function buildBreadcrumb({
  universeTitle,
  galaxyName,
  objectiveName,
  taskName,
  subtaskName,
}: {
  universeTitle: string;
  galaxyName: string | null;
  objectiveName: string | null;
  taskName: string | null;
  subtaskName: string | null;
}) {
  return [
    universeTitle,
    galaxyName,
    objectiveName,
    taskName,
    subtaskName,
  ].filter((segment): segment is string => Boolean(segment));
}

function HubBadge({
  title,
  subtitle,
  description,
  point,
  accent = "#7dd3fc",
  layoutId,
  introOrigin,
}: {
  title: string;
  subtitle: string;
  description: string;
  point: Point;
  accent?: string;
  layoutId?: string;
  introOrigin?: Point | null;
}) {
  const delay = entranceDelay(point, introOrigin ?? null);

  return (
      <motion.div
        data-universe-node="true"
        layoutId={layoutId}
        className="absolute w-[264px] -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-white/12 bg-slate-950/74 p-16 shadow-[0_24px_100px_rgba(2,6,23,0.45)] backdrop-blur-2xl"
      style={{ left: point.x, top: point.y }}
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center gap-12">
        <div
          className="size-[48px] rounded-full shadow-[0_0_50px_rgba(255,255,255,0.2)]"
          style={{ background: `radial-gradient(circle, ${accent}, transparent 72%)` }}
        />
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{subtitle}</p>
          <h2 className="mt-8 text-[24px] leading-[1.04] font-semibold tracking-[-0.05em] text-white">
            {title}
          </h2>
        </div>
      </div>
      <p className="mt-12 text-sm leading-[1.6] text-slate-300">{description}</p>
    </motion.div>
  );
}

function GalaxyCard({
  galaxy,
  point,
  introOrigin,
  onSelect,
}: {
  galaxy: UniverseData["galaxies"][number];
  point: Point;
  introOrigin?: Point | null;
  onSelect: () => void;
}) {
  const delay = entranceDelay(point, introOrigin ?? null);

  return (
    <motion.button
      data-universe-node="true"
      layoutId={`galaxy-${galaxy.id}`}
      type="button"
      onClick={onSelect}
      className="absolute w-[188px] -translate-x-1/2 -translate-y-1/2 rounded-[24px] border border-white/10 bg-slate-950/70 p-16 text-left shadow-[0_20px_80px_rgba(2,6,23,0.32)] backdrop-blur-2xl transition hover:border-white/18 hover:bg-slate-950/78"
      style={{ left: point.x, top: point.y }}
      initial={{ opacity: 0, scale: 0.94, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: [0, -4, 0] }}
      transition={{
        opacity: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] },
        scale: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] },
        y: {
          duration: 5.2 + (point.x % 7) * 0.18,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        },
      }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between gap-12">
        <div className="relative size-[56px]">
          <div
            className="absolute inset-0 rounded-full opacity-70"
            style={{ background: `radial-gradient(circle, ${galaxy.color}, transparent 72%)` }}
          />
          <div className="absolute inset-[8px] rounded-full border border-white/16" />
          <div className="absolute inset-[16px] rounded-full border border-white/12" />
        </div>
        <div className="rounded-full border border-white/8 bg-white/[0.03] px-8 py-4 text-[10px] text-slate-400">
          {galaxy.progress}%
        </div>
      </div>
      <p className="mt-12 text-[10px] uppercase tracking-[0.18em] text-slate-400">{galaxy.category}</p>
      <p className="mt-8 text-base font-medium text-white">{galaxy.name}</p>
      <p className="mt-8 text-sm leading-[1.55] text-slate-300">
        {galaxy.objectives.length} objectives
      </p>
    </motion.button>
  );
}

function ObjectiveCard2D({
  objective,
  accent,
  point,
  introOrigin,
  onSelect,
}: {
  objective: ObjectiveNode;
  accent: string;
  point: Point;
  introOrigin?: Point | null;
  onSelect: () => void;
}) {
  const delay = entranceDelay(point, introOrigin ?? null);

  return (
    <motion.button
      data-universe-node="true"
      layoutId={`objective-${objective.id}`}
      type="button"
      onClick={onSelect}
      className="absolute w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-[24px] border border-white/10 bg-slate-950/70 p-16 text-left shadow-[0_18px_70px_rgba(2,6,23,0.32)] backdrop-blur-2xl transition hover:border-amber-200/28 hover:bg-slate-950/78"
      style={{ left: point.x, top: point.y }}
      initial={{ opacity: 0, scale: 0.94, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: [0, -3, 0] }}
      transition={{
        opacity: { duration: 0.42, delay, ease: [0.22, 1, 0.36, 1] },
        scale: { duration: 0.42, delay, ease: [0.22, 1, 0.36, 1] },
        y: {
          duration: 4.6 + (point.y % 5) * 0.24,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        },
      }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-12">
        <div className="relative size-[52px] shrink-0">
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,#fbbf24,transparent_70%)]" />
          <div className="absolute inset-[8px] rounded-full border border-amber-100/20" />
          <div className="absolute inset-[-6px] rounded-full border border-white/8" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Objective</p>
          <p className="mt-6 truncate text-sm font-medium text-white">{objective.name}</p>
        </div>
      </div>
      <p className="mt-12 text-sm leading-[1.55] text-slate-300">{objective.tasks.length} tasks</p>
      <div className="mt-8 h-[6px] overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full"
          style={{
            width: `${objective.progress}%`,
            background: `linear-gradient(90deg, ${accent}, rgba(251,191,36,0.9))`,
          }}
        />
      </div>
    </motion.button>
  );
}

function ObjectiveSun2D({
  objective,
  point,
  compact = false,
  introOrigin,
}: {
  objective: ObjectiveNode;
  point: Point;
  compact?: boolean;
  introOrigin?: Point | null;
}) {
  const size = compact ? 164 : 228;
  const delay = entranceDelay(point, introOrigin ?? null);

  return (
    <motion.div
      data-universe-node="true"
      layoutId={`objective-${objective.id}`}
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: point.x, top: point.y }}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="relative rounded-full"
        style={{ width: size, height: size }}
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 4.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      >
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,#fef3c7_0%,#fbbf24_38%,rgba(251,191,36,0.12)_72%,transparent_100%)]" />
        <div className="absolute inset-[12px] rounded-full border border-amber-100/16" />
        <div className="absolute inset-[-10px] rounded-full border border-white/8" />
      </motion.div>
      <div className="absolute left-1/2 top-[calc(100%+16px)] w-[240px] -translate-x-1/2 text-center">
        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Objective sun</p>
        <h3 className="mt-8 text-[24px] leading-[1.05] font-semibold tracking-[-0.05em] text-white">
          {objective.name}
        </h3>
        <p className="mt-8 text-sm leading-[1.6] text-slate-300">{objective.description}</p>
      </div>
    </motion.div>
  );
}

function TaskNode2D({
  task,
  point,
  introOrigin,
  onSelect,
}: {
  task: TaskNode;
  point: Point;
  introOrigin?: Point | null;
  onSelect: () => void;
}) {
  const visual = stateVisuals(task.state);
  const delay = entranceDelay(point, introOrigin ?? null);

  return (
    <motion.button
      data-universe-node="true"
      layoutId={`task-${task.id}`}
      type="button"
      onClick={onSelect}
      className="absolute w-[156px] -translate-x-1/2 -translate-y-1/2 rounded-[22px] border border-white/10 bg-slate-950/72 p-12 text-left shadow-[0_16px_60px_rgba(2,6,23,0.28)] backdrop-blur-xl transition hover:border-white/18 hover:bg-slate-950/80"
      style={{ left: point.x, top: point.y }}
      initial={{ opacity: 0, scale: 0.94, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: [0, -2, 0] }}
      transition={{
        opacity: { duration: 0.42, delay, ease: [0.22, 1, 0.36, 1] },
        scale: { duration: 0.42, delay, ease: [0.22, 1, 0.36, 1] },
        y: {
          duration: 4.1 + (point.x % 9) * 0.16,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        },
      }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-12">
        <div
          className="relative size-[40px] shrink-0 rounded-full"
          style={{ background: `radial-gradient(circle, ${visual.color}, transparent 72%)` }}
        >
          <div className="absolute inset-[-4px] rounded-full border border-white/10" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{task.name}</p>
          <p className="mt-4 text-[10px] uppercase tracking-[0.14em] text-slate-400">
            {task.state.replace("_", " ")}
          </p>
        </div>
      </div>
      <p className="mt-10 text-xs text-slate-400">{task.subtasks.length} subtasks</p>
      <div className="mt-8 h-[6px] overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full"
          style={{ width: `${task.progress}%`, backgroundColor: visual.color }}
        />
      </div>
    </motion.button>
  );
}

function TaskFocus2D({
  task,
  point,
  introOrigin,
  onSelect,
}: {
  task: TaskNode;
  point: Point;
  introOrigin?: Point | null;
  onSelect: () => void;
}) {
  const visual = stateVisuals(task.state);
  const delay = entranceDelay(point, introOrigin ?? null);

  return (
    <motion.button
      data-universe-node="true"
      layoutId={`task-${task.id}`}
      type="button"
      onClick={onSelect}
      className="absolute w-[264px] -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-white/12 bg-slate-950/76 p-16 text-left shadow-[0_24px_100px_rgba(2,6,23,0.38)] backdrop-blur-2xl transition hover:border-white/18 hover:bg-slate-950/84"
      style={{ left: point.x, top: point.y }}
      initial={{ opacity: 0, scale: 0.96, x: 12 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ duration: 0.42, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center gap-12">
        <div
          className="relative size-[72px] shrink-0 rounded-full"
          style={{ background: `radial-gradient(circle, ${visual.color}, transparent 72%)` }}
        >
          <div className="absolute inset-[-8px] rounded-full border border-white/12" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Focused task</p>
          <p className="mt-8 text-[22px] leading-[1.04] font-semibold tracking-[-0.04em] text-white">
            {task.name}
          </p>
        </div>
      </div>
      <p className="mt-12 text-sm leading-[1.6] text-slate-300">{task.summary}</p>
      <div className="mt-12 flex items-center justify-between text-xs text-slate-400">
        <span>{task.progress}% complete</span>
        <span>{task.subtasks.length} subtasks</span>
      </div>
      <div className="mt-8 h-[8px] overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full"
          style={{ width: `${task.progress}%`, backgroundColor: visual.color }}
        />
      </div>
    </motion.button>
  );
}

function HabitMarker2D({
  habit,
  point,
  introOrigin,
  selected,
  onSelect,
}: {
  habit: HabitNode;
  point: Point;
  introOrigin?: Point | null;
  selected: boolean;
  onSelect: () => void;
}) {
  const delay = entranceDelay(point, introOrigin ?? null);
  const ringScale = habit.cadence === "daily" ? 1 : habit.cadence === "weekly" ? 1.08 : 1.16;

  return (
    <motion.button
      data-universe-node="true"
      type="button"
      onClick={onSelect}
      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-10 py-6 text-left backdrop-blur-xl transition ${
        selected
          ? "border-cyan-200/28 bg-cyan-400/12 shadow-[0_0_40px_rgba(34,211,238,0.18)]"
          : "border-cyan-300/16 bg-slate-950/72 shadow-[0_10px_40px_rgba(8,47,73,0.24)] hover:bg-slate-950/82"
      }`}
      style={{ left: point.x, top: point.y }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: selected ? [1.04, 1.08, 1.04] : [1, 1.03, 1] }}
      transition={{
        opacity: { duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] },
        scale: { duration: 3.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
      }}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-10">
        <div
          className="relative grid place-items-center rounded-full"
          style={{ width: 28 * ringScale, height: 28 * ringScale }}
        >
          <svg
            width={28 * ringScale}
            height={28 * ringScale}
            viewBox="0 0 28 28"
            className="-rotate-90"
          >
            <circle
              cx="14"
              cy="14"
              r="10"
              fill="none"
              stroke="rgba(148,163,184,0.22)"
              strokeWidth={selected ? 4 : 3.5}
            />
            <circle
              cx="14"
              cy="14"
              r="10"
              fill="none"
              stroke="rgba(34,211,238,0.9)"
              strokeWidth={selected ? 4 : 3.5}
              strokeLinecap="round"
              strokeDasharray={62.83}
              strokeDashoffset={62.83 - (62.83 * habit.progress) / 100}
            />
          </svg>
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.22),transparent_72%)]" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-cyan-100">{habit.cadence}</p>
          <p className="mt-4 text-[10px] text-slate-300">{habit.completedCount}/{habit.target}</p>
        </div>
      </div>
    </motion.button>
  );
}

function SubtaskNode2D({
  subtask,
  selected,
  point,
  introOrigin,
  onSelect,
}: {
  subtask: TaskNode["subtasks"][number];
  selected: boolean;
  point: Point;
  introOrigin?: Point | null;
  onSelect: () => void;
}) {
  const delay = entranceDelay(point, introOrigin ?? null);

  return (
    <motion.button
      data-universe-node="true"
      type="button"
      onClick={onSelect}
      className={`absolute w-[132px] -translate-x-1/2 -translate-y-1/2 rounded-[18px] border p-10 text-left shadow-[0_14px_50px_rgba(2,6,23,0.26)] backdrop-blur-xl transition ${
        selected
          ? "border-sky-300/26 bg-sky-400/10"
          : "border-white/10 bg-slate-950/72 hover:border-white/18 hover:bg-slate-950/80"
      }`}
      style={{ left: point.x, top: point.y }}
      initial={{ opacity: 0, scale: 0.92, y: 8 }}
      animate={{ opacity: 1, scale: selected ? 1.02 : 1, y: selected ? [0, -3, 0] : [0, -2, 0] }}
      transition={{
        opacity: { duration: 0.38, delay, ease: [0.22, 1, 0.36, 1] },
        scale: { duration: 0.38, delay, ease: [0.22, 1, 0.36, 1] },
        y: {
          duration: 3.8 + (point.y % 7) * 0.14,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        },
      }}
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-8">
        <div className="size-[14px] rotate-45 rounded-[3px] bg-slate-100" />
        <p className="truncate text-sm font-medium text-white">{subtask.name}</p>
      </div>
      <p className="mt-8 text-[10px] uppercase tracking-[0.14em] text-slate-400">
        {subtask.progress}% complete
      </p>
    </motion.button>
  );
}
