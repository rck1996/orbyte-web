"use client";

import { create } from "zustand";

type UniverseStore = {
  hoveredGalaxyId: string | null;
  selectedGalaxyId: string | null;
  selectedObjectiveId: string | null;
  selectedTaskId: string | null;
  hoveredSubtaskId: string | null;
  setHoveredGalaxy: (id: string | null) => void;
  selectGalaxy: (id: string | null) => void;
  selectObjective: (id: string | null) => void;
  selectTask: (id: string | null) => void;
  setHoveredSubtask: (id: string | null) => void;
  bootstrap: (galaxyId: string | null) => void;
};

export const useUniverseStore = create<UniverseStore>((set) => ({
  hoveredGalaxyId: null,
  selectedGalaxyId: null,
  selectedObjectiveId: null,
  selectedTaskId: null,
  hoveredSubtaskId: null,
  setHoveredGalaxy: (id) => set({ hoveredGalaxyId: id }),
  selectGalaxy: (id) =>
    set({
      selectedGalaxyId: id,
      selectedObjectiveId: null,
      selectedTaskId: null,
    }),
  selectObjective: (id) => set({ selectedObjectiveId: id, selectedTaskId: null }),
  selectTask: (id) => set({ selectedTaskId: id }),
  setHoveredSubtask: (id) => set({ hoveredSubtaskId: id }),
  bootstrap: (galaxyId) =>
    set((state) => ({
      selectedGalaxyId: state.selectedGalaxyId ?? galaxyId,
    })),
}));
