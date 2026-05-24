import type {
  GalaxyNode,
  ObjectiveNode,
  SubtaskNode,
  TaskNode,
  UniverseData,
} from "@/types/universe";

export type FocusEntity = {
  galaxy: GalaxyNode | null;
  objective: ObjectiveNode | null;
  task: TaskNode | null;
  subtask: SubtaskNode | null;
};

export function getFocusEntity(
  universe: UniverseData,
  selectedGalaxyId: string | null,
  selectedObjectiveId: string | null,
  selectedTaskId: string | null,
  selectedSubtaskId: string | null,
): FocusEntity {
  const galaxy =
    universe.galaxies.find((item) => item.id === selectedGalaxyId) ?? null;
  const objective =
    galaxy?.objectives.find((item) => item.id === selectedObjectiveId) ?? null;
  const task = objective?.tasks.find((item) => item.id === selectedTaskId) ?? null;
  const subtask = task?.subtasks.find((item) => item.id === selectedSubtaskId) ?? null;

  return { galaxy, objective, task, subtask };
}

export function getFocusTasks(focus: FocusEntity): TaskNode[] {
  if (focus.subtask && focus.task) {
    return [focus.task];
  }

  if (focus.task) {
    return [focus.task];
  }

  if (focus.objective) {
    return focus.objective.tasks;
  }

  if (focus.galaxy) {
    return focus.galaxy.objectives.flatMap((objective) => objective.tasks);
  }

  return [];
}

export function getFocusProgress(focus: FocusEntity): number {
  if (focus.subtask) {
    return focus.subtask.progress;
  }

  if (focus.task) {
    return focus.task.progress;
  }

  if (focus.objective) {
    return focus.objective.progress;
  }

  if (focus.galaxy) {
    return focus.galaxy.progress;
  }

  return 0;
}

export function getFocusDescription(
  universe: UniverseData,
  focus: FocusEntity,
) {
  return (
    focus.subtask?.metadata ??
    focus.task?.summary ??
    focus.objective?.description ??
    focus.galaxy?.description ??
    universe.summary
  );
}

export function getFocusTitle(universe: UniverseData, focus: FocusEntity) {
  return (
    focus.subtask?.name ??
    focus.task?.name ??
    focus.objective?.name ??
    focus.galaxy?.name ??
    universe.title
  );
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
