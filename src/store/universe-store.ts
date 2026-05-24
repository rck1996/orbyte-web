"use client";

import { create } from "zustand";

type UniverseStore = {
  interactionMode: "guided" | "explore";
  hoveredGalaxyId: string | null;
  selectedGalaxyId: string | null;
  selectedObjectiveId: string | null;
  selectedTaskId: string | null;
  selectedSubtaskId: string | null;
  taskModalOpen: boolean;
  hoveredSubtaskId: string | null;
  dragOffset: { x: number; y: number };
  suppressClickUntil: number;
  setHoveredGalaxy: (id: string | null) => void;
  selectGalaxy: (id: string | null) => void;
  selectObjective: (id: string | null) => void;
  selectTask: (id: string | null) => void;
  selectSubtask: (id: string | null) => void;
  openTaskModal: () => void;
  closeTaskModal: () => void;
  zoomToMap: () => void;
  stepOut: () => void;
  stepSelection: (direction: "next" | "prev", universe: import("@/types/universe").UniverseData) => void;
  setHoveredSubtask: (id: string | null) => void;
  panBy: (deltaX: number, deltaY: number) => void;
  setPan: (x: number, y: number) => void;
  resetPan: () => void;
  setInteractionMode: (mode: "guided" | "explore") => void;
  suppressSceneClicks: (durationMs: number) => void;
  bootstrap: (galaxyId: string | null) => void;
};

export const useUniverseStore = create<UniverseStore>((set) => ({
  interactionMode: "guided",
  hoveredGalaxyId: null,
  selectedGalaxyId: null,
  selectedObjectiveId: null,
  selectedTaskId: null,
  selectedSubtaskId: null,
  taskModalOpen: false,
  hoveredSubtaskId: null,
  dragOffset: { x: 0, y: 0 },
  suppressClickUntil: 0,
  setHoveredGalaxy: (id) => set({ hoveredGalaxyId: id }),
  selectGalaxy: (id) =>
    set({
      selectedGalaxyId: id,
      selectedObjectiveId: null,
      selectedTaskId: null,
      selectedSubtaskId: null,
      taskModalOpen: false,
    }),
  selectObjective: (id) =>
    set({ selectedObjectiveId: id, selectedTaskId: null, selectedSubtaskId: null, taskModalOpen: false }),
  selectTask: (id) => set({ selectedTaskId: id, selectedSubtaskId: null, taskModalOpen: id !== null }),
  selectSubtask: (id) => set({ selectedSubtaskId: id, taskModalOpen: id !== null }),
  openTaskModal: () => set({ taskModalOpen: true }),
  closeTaskModal: () => set({ taskModalOpen: false }),
  zoomToMap: () =>
    set({
      selectedGalaxyId: null,
      selectedObjectiveId: null,
      selectedTaskId: null,
      selectedSubtaskId: null,
      taskModalOpen: false,
    }),
  stepOut: () =>
    set((state) => {
      if (state.selectedSubtaskId) {
        return { selectedSubtaskId: null, taskModalOpen: true };
      }

      if (state.selectedTaskId) {
        return { selectedTaskId: null, selectedSubtaskId: null, taskModalOpen: false };
      }

      if (state.selectedObjectiveId) {
        return { selectedObjectiveId: null, selectedTaskId: null, selectedSubtaskId: null, taskModalOpen: false };
      }

      if (state.selectedGalaxyId) {
        return {
          selectedGalaxyId: null,
          selectedObjectiveId: null,
          selectedTaskId: null,
          selectedSubtaskId: null,
          taskModalOpen: false,
        };
      }

      return state;
    }),
  stepSelection: (direction, universe) =>
    set((state) => {
      const selectedGalaxy =
        universe.galaxies.find((galaxy) => galaxy.id === state.selectedGalaxyId) ?? null;
      const selectedObjective =
        selectedGalaxy?.objectives.find((objective) => objective.id === state.selectedObjectiveId) ??
        null;
      const selectedTask =
        selectedObjective?.tasks.find((task) => task.id === state.selectedTaskId) ?? null;

      const items = state.selectedSubtaskId && selectedTask
        ? selectedTask.subtasks.map((subtask) => subtask.id)
        : state.selectedTaskId && selectedObjective
          ? selectedObjective.tasks.map((task) => task.id)
          : state.selectedObjectiveId && selectedGalaxy
            ? selectedGalaxy.objectives.map((objective) => objective.id)
            : universe.galaxies.map((galaxy) => galaxy.id);

      const activeId = state.selectedSubtaskId
        ? state.selectedSubtaskId
        : state.selectedTaskId
          ? state.selectedTaskId
          : state.selectedObjectiveId
            ? state.selectedObjectiveId
            : state.selectedGalaxyId;

      if (items.length === 0) {
        return state;
      }

      const currentIndex = Math.max(items.indexOf(activeId ?? items[0]), 0);
      const nextIndex =
        direction === "next"
          ? (currentIndex + 1) % items.length
          : (currentIndex - 1 + items.length) % items.length;
      const nextId = items[nextIndex];

      if (state.selectedSubtaskId && selectedTask) {
        return { selectedSubtaskId: nextId, taskModalOpen: true };
      }

      if (state.selectedTaskId && selectedObjective) {
        return { selectedTaskId: nextId, selectedSubtaskId: null, taskModalOpen: true };
      }

      if (state.selectedObjectiveId && selectedGalaxy) {
        return { selectedObjectiveId: nextId, selectedTaskId: null, selectedSubtaskId: null, taskModalOpen: false };
      }

      return {
        selectedGalaxyId: nextId,
        selectedObjectiveId: null,
        selectedTaskId: null,
        selectedSubtaskId: null,
        taskModalOpen: false,
      };
    }),
  setHoveredSubtask: (id) => set({ hoveredSubtaskId: id }),
  panBy: (deltaX, deltaY) =>
    set((state) => ({
      dragOffset: {
        x: Math.max(-780, Math.min(780, state.dragOffset.x + deltaX)),
        y: Math.max(-620, Math.min(620, state.dragOffset.y + deltaY)),
      },
    })),
  setPan: (x, y) =>
    set({
      dragOffset: {
        x: Math.max(-780, Math.min(780, x)),
        y: Math.max(-620, Math.min(620, y)),
      },
    }),
  resetPan: () => set({ dragOffset: { x: 0, y: 0 } }),
  setInteractionMode: (mode) =>
    set((state) => ({
      interactionMode: mode,
      dragOffset: mode === "guided" ? { x: 0, y: 0 } : state.dragOffset,
    })),
  suppressSceneClicks: (durationMs) =>
    set({ suppressClickUntil: Date.now() + durationMs }),
  bootstrap: () =>
    set((state) => ({
      selectedGalaxyId: state.selectedGalaxyId ?? null,
    })),
}));
