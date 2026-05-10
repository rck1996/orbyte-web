import type {
  GalaxyNode,
  ObjectiveNode,
  TaskNode,
  UniverseData,
} from "@/types/universe";

export type FocusEntity = {
  galaxy: GalaxyNode | null;
  objective: ObjectiveNode | null;
  task: TaskNode | null;
};

export function getFocusEntity(
  universe: UniverseData,
  selectedGalaxyId: string | null,
  selectedObjectiveId: string | null,
  selectedTaskId: string | null,
): FocusEntity {
  const galaxy =
    universe.galaxies.find((item) => item.id === selectedGalaxyId) ?? universe.galaxies[0] ?? null;
  const objective =
    galaxy?.objectives.find((item) => item.id === selectedObjectiveId) ?? null;
  const task = objective?.tasks.find((item) => item.id === selectedTaskId) ?? null;

  return { galaxy, objective, task };
}

export function stateVisuals(state: TaskNode["state"]) {
  switch (state) {
    case "todo":
      return {
        color: "#7c93b5",
        emissive: "#54708f",
        scale: 0.72,
      };
    case "in_progress":
      return {
        color: "#9dd6ff",
        emissive: "#60a5fa",
        scale: 0.84,
      };
    case "done":
      return {
        color: "#86efac",
        emissive: "#22c55e",
        scale: 0.78,
      };
    case "blocked":
      return {
        color: "#fb7185",
        emissive: "#ef4444",
        scale: 0.82,
      };
  }
}
