import "server-only";

import { randomUUID } from "node:crypto";

import { workspaceToUniverse } from "@/lib/server/universe-mappers";
import { readUniverseWorkspace, writeUniverseWorkspace } from "@/lib/server/universe-repository";
import type {
  DomainCategory,
  DomainObjective,
  DomainSubtask,
  DomainTask,
  Habit,
  HabitCadence,
  TaskState,
  WorkspaceDomain,
} from "@/types/domain";
import type { UniverseData } from "@/types/universe";

export type CategoryInput = {
  name: string;
  category: string;
  color: string;
  accent: string;
  description: string;
  position?: [number, number, number];
};

export type ObjectiveInput = {
  categoryId: string;
  name: string;
  description: string;
  orbitRadius: number;
  habitIds?: string[];
};

export type TaskInput = {
  objectiveId: string;
  name: string;
  state: TaskState;
  progress: number;
  dueDate: string;
  summary: string;
};

export type SubtaskInput = {
  taskId: string;
  name: string;
  progress: number;
  dueDate: string;
  metadata: string;
};

export type HabitInput = {
  name: string;
  description: string;
  cadence: HabitCadence;
  target: number;
  completedCount: number;
  streak: number;
  metricLabel: string;
  linkedObjectiveIds?: string[];
};

export class UniverseServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "bad_request" | "not_found",
  ) {
    super(message);
  }
}

function clampProgress(value: number): number {
  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

function assertNonEmpty(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new UniverseServiceError(`${label} is required.`, "bad_request");
  }

  return value.trim();
}

function assertNumber(value: unknown, label: string): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new UniverseServiceError(`${label} must be a number.`, "bad_request");
  }

  return value;
}

function findCategory(workspace: WorkspaceDomain, categoryId: string) {
  return workspace.categories.find((category) => category.id === categoryId) ?? null;
}

function findObjective(workspace: WorkspaceDomain, objectiveId: string) {
  for (const category of workspace.categories) {
    const objective = category.objectives.find((item) => item.id === objectiveId);

    if (objective) {
      return { category, objective };
    }
  }

  return null;
}

function findTask(workspace: WorkspaceDomain, taskId: string) {
  for (const category of workspace.categories) {
    for (const objective of category.objectives) {
      const task = objective.tasks.find((item) => item.id === taskId);

      if (task) {
        return { category, objective, task };
      }
    }
  }

  return null;
}

function findSubtask(workspace: WorkspaceDomain, subtaskId: string) {
  for (const category of workspace.categories) {
    for (const objective of category.objectives) {
      for (const task of objective.tasks) {
        const subtask = task.subtasks.find((item) => item.id === subtaskId);

        if (subtask) {
          return { category, objective, task, subtask };
        }
      }
    }
  }

  return null;
}

function findHabit(workspace: WorkspaceDomain, habitId: string) {
  return workspace.habits.find((habit) => habit.id === habitId) ?? null;
}

function objectiveExists(workspace: WorkspaceDomain, objectiveId: string) {
  return workspace.categories.some((category) =>
    category.objectives.some((objective) => objective.id === objectiveId),
  );
}

function syncHabitLinks(workspace: WorkspaceDomain, habitId: string, linkedObjectiveIds: string[]) {
  for (const category of workspace.categories) {
    for (const objective of category.objectives) {
      const isLinked = linkedObjectiveIds.includes(objective.id);
      const hasLink = objective.habitIds.includes(habitId);

      if (isLinked && !hasLink) {
        objective.habitIds.push(habitId);
      }

      if (!isLinked && hasLink) {
        objective.habitIds = objective.habitIds.filter((id) => id !== habitId);
      }
    }
  }
}

async function mutateWorkspace(
  mutator: (workspace: WorkspaceDomain) => void,
): Promise<WorkspaceDomain> {
  const workspace = await readUniverseWorkspace();
  mutator(workspace);
  return writeUniverseWorkspace(workspace);
}

export async function getUniverseData(): Promise<UniverseData> {
  const workspace = await readUniverseWorkspace();
  return workspaceToUniverse(workspace);
}

export async function getWorkspaceDomain() {
  return readUniverseWorkspace();
}

export async function createCategory(input: CategoryInput) {
  const category: DomainCategory = {
    id: randomUUID(),
    name: assertNonEmpty(input.name, "name"),
    category: assertNonEmpty(input.category, "category"),
    color: assertNonEmpty(input.color, "color"),
    accent: assertNonEmpty(input.accent, "accent"),
    description: assertNonEmpty(input.description, "description"),
    position: input.position ?? [0, 0, 0],
    objectives: [],
  };

  const workspace = await mutateWorkspace((draft) => {
    draft.categories.push(category);
  });

  return workspace.categories.find((item) => item.id === category.id) ?? category;
}

export async function updateCategory(categoryId: string, input: Partial<CategoryInput>) {
  const workspace = await mutateWorkspace((draft) => {
    const category = findCategory(draft, categoryId);

    if (!category) {
      throw new UniverseServiceError("Category not found.", "not_found");
    }

    if (input.name !== undefined) category.name = assertNonEmpty(input.name, "name");
    if (input.category !== undefined) category.category = assertNonEmpty(input.category, "category");
    if (input.color !== undefined) category.color = assertNonEmpty(input.color, "color");
    if (input.accent !== undefined) category.accent = assertNonEmpty(input.accent, "accent");
    if (input.description !== undefined) {
      category.description = assertNonEmpty(input.description, "description");
    }
    if (input.position !== undefined) category.position = input.position;
  });

  const category = findCategory(workspace, categoryId);

  if (!category) {
    throw new UniverseServiceError("Category not found.", "not_found");
  }

  return category;
}

export async function deleteCategory(categoryId: string) {
  await mutateWorkspace((draft) => {
    const index = draft.categories.findIndex((category) => category.id === categoryId);

    if (index === -1) {
      throw new UniverseServiceError("Category not found.", "not_found");
    }

    const removedObjectiveIds = draft.categories[index].objectives.map((objective) => objective.id);
    draft.categories.splice(index, 1);
    draft.habits = draft.habits.map((habit) => ({
      ...habit,
      linkedObjectiveIds: habit.linkedObjectiveIds.filter((id) => !removedObjectiveIds.includes(id)),
    }));
  });
}

export async function createObjective(input: ObjectiveInput) {
  const objective: DomainObjective = {
    id: randomUUID(),
    name: assertNonEmpty(input.name, "name"),
    description: assertNonEmpty(input.description, "description"),
    orbitRadius: assertNumber(input.orbitRadius, "orbitRadius"),
    habitIds: input.habitIds ?? [],
    tasks: [],
  };

  const workspace = await mutateWorkspace((draft) => {
    const category = findCategory(draft, input.categoryId);

    if (!category) {
      throw new UniverseServiceError("Category not found.", "not_found");
    }

    category.objectives.push(objective);
  });

  const result = findObjective(workspace, objective.id);
  return result?.objective ?? objective;
}

export async function updateObjective(objectiveId: string, input: Partial<ObjectiveInput>) {
  const workspace = await mutateWorkspace((draft) => {
    const result = findObjective(draft, objectiveId);

    if (!result) {
      throw new UniverseServiceError("Objective not found.", "not_found");
    }

    if (input.name !== undefined) result.objective.name = assertNonEmpty(input.name, "name");
    if (input.description !== undefined) {
      result.objective.description = assertNonEmpty(input.description, "description");
    }
    if (input.orbitRadius !== undefined) {
      result.objective.orbitRadius = assertNumber(input.orbitRadius, "orbitRadius");
    }
    if (input.habitIds !== undefined) {
      result.objective.habitIds = input.habitIds;
    }
  });

  const result = findObjective(workspace, objectiveId);

  if (!result) {
    throw new UniverseServiceError("Objective not found.", "not_found");
  }

  return result.objective;
}

export async function deleteObjective(objectiveId: string) {
  await mutateWorkspace((draft) => {
    const result = findObjective(draft, objectiveId);

    if (!result) {
      throw new UniverseServiceError("Objective not found.", "not_found");
    }

    result.category.objectives = result.category.objectives.filter((item) => item.id !== objectiveId);
    draft.habits = draft.habits.map((habit) => ({
      ...habit,
      linkedObjectiveIds: habit.linkedObjectiveIds.filter((id) => id !== objectiveId),
    }));
  });
}

export async function createTask(input: TaskInput) {
  const task: DomainTask = {
    id: randomUUID(),
    name: assertNonEmpty(input.name, "name"),
    state: input.state,
    progress: clampProgress(assertNumber(input.progress, "progress")),
    dueDate: assertNonEmpty(input.dueDate, "dueDate"),
    summary: assertNonEmpty(input.summary, "summary"),
    subtasks: [],
  };

  const workspace = await mutateWorkspace((draft) => {
    const result = findObjective(draft, input.objectiveId);

    if (!result) {
      throw new UniverseServiceError("Objective not found.", "not_found");
    }

    result.objective.tasks.push(task);
  });

  const result = findTask(workspace, task.id);
  return result?.task ?? task;
}

export async function updateTask(taskId: string, input: Partial<TaskInput>) {
  const workspace = await mutateWorkspace((draft) => {
    const result = findTask(draft, taskId);

    if (!result) {
      throw new UniverseServiceError("Task not found.", "not_found");
    }

    if (input.name !== undefined) result.task.name = assertNonEmpty(input.name, "name");
    if (input.state !== undefined) result.task.state = input.state;
    if (input.progress !== undefined) {
      result.task.progress = clampProgress(assertNumber(input.progress, "progress"));
    }
    if (input.dueDate !== undefined) {
      result.task.dueDate = assertNonEmpty(input.dueDate, "dueDate");
    }
    if (input.summary !== undefined) {
      result.task.summary = assertNonEmpty(input.summary, "summary");
    }
  });

  const result = findTask(workspace, taskId);

  if (!result) {
    throw new UniverseServiceError("Task not found.", "not_found");
  }

  return result.task;
}

export async function deleteTask(taskId: string) {
  await mutateWorkspace((draft) => {
    const result = findTask(draft, taskId);

    if (!result) {
      throw new UniverseServiceError("Task not found.", "not_found");
    }

    result.objective.tasks = result.objective.tasks.filter((item) => item.id !== taskId);
  });
}

export async function createSubtask(input: SubtaskInput) {
  const subtask: DomainSubtask = {
    id: randomUUID(),
    name: assertNonEmpty(input.name, "name"),
    progress: clampProgress(assertNumber(input.progress, "progress")),
    dueDate: assertNonEmpty(input.dueDate, "dueDate"),
    metadata: assertNonEmpty(input.metadata, "metadata"),
  };

  const workspace = await mutateWorkspace((draft) => {
    const result = findTask(draft, input.taskId);

    if (!result) {
      throw new UniverseServiceError("Task not found.", "not_found");
    }

    result.task.subtasks.push(subtask);
  });

  const result = findSubtask(workspace, subtask.id);
  return result?.subtask ?? subtask;
}

export async function updateSubtask(subtaskId: string, input: Partial<SubtaskInput>) {
  const workspace = await mutateWorkspace((draft) => {
    const result = findSubtask(draft, subtaskId);

    if (!result) {
      throw new UniverseServiceError("Subtask not found.", "not_found");
    }

    if (input.name !== undefined) result.subtask.name = assertNonEmpty(input.name, "name");
    if (input.progress !== undefined) {
      result.subtask.progress = clampProgress(assertNumber(input.progress, "progress"));
    }
    if (input.dueDate !== undefined) {
      result.subtask.dueDate = assertNonEmpty(input.dueDate, "dueDate");
    }
    if (input.metadata !== undefined) {
      result.subtask.metadata = assertNonEmpty(input.metadata, "metadata");
    }
  });

  const result = findSubtask(workspace, subtaskId);

  if (!result) {
    throw new UniverseServiceError("Subtask not found.", "not_found");
  }

  return result.subtask;
}

export async function deleteSubtask(subtaskId: string) {
  await mutateWorkspace((draft) => {
    const result = findSubtask(draft, subtaskId);

    if (!result) {
      throw new UniverseServiceError("Subtask not found.", "not_found");
    }

    result.task.subtasks = result.task.subtasks.filter((item) => item.id !== subtaskId);
  });
}

export async function listHabits() {
  const workspace = await readUniverseWorkspace();
  return workspace.habits;
}

export async function createHabit(input: HabitInput) {
  const linkedObjectiveIds = [...new Set(input.linkedObjectiveIds ?? [])];
  const habit: Habit = {
    id: randomUUID(),
    name: assertNonEmpty(input.name, "name"),
    description: assertNonEmpty(input.description, "description"),
    cadence: input.cadence,
    target: assertNumber(input.target, "target"),
    completedCount: assertNumber(input.completedCount, "completedCount"),
    streak: assertNumber(input.streak, "streak"),
    metricLabel: assertNonEmpty(input.metricLabel, "metricLabel"),
    linkedObjectiveIds,
  };

  const workspace = await mutateWorkspace((draft) => {
    for (const objectiveId of linkedObjectiveIds) {
      if (!objectiveExists(draft, objectiveId)) {
        throw new UniverseServiceError("Linked objective not found.", "not_found");
      }
    }

    draft.habits.push(habit);
    syncHabitLinks(draft, habit.id, linkedObjectiveIds);
  });

  return findHabit(workspace, habit.id) ?? habit;
}

export async function updateHabit(habitId: string, input: Partial<HabitInput>) {
  const workspace = await mutateWorkspace((draft) => {
    const habit = findHabit(draft, habitId);

    if (!habit) {
      throw new UniverseServiceError("Habit not found.", "not_found");
    }

    if (input.name !== undefined) habit.name = assertNonEmpty(input.name, "name");
    if (input.description !== undefined) {
      habit.description = assertNonEmpty(input.description, "description");
    }
    if (input.cadence !== undefined) habit.cadence = input.cadence;
    if (input.target !== undefined) {
      habit.target = assertNumber(input.target, "target");
    }
    if (input.completedCount !== undefined) {
      habit.completedCount = assertNumber(input.completedCount, "completedCount");
    }
    if (input.streak !== undefined) {
      habit.streak = assertNumber(input.streak, "streak");
    }
    if (input.metricLabel !== undefined) {
      habit.metricLabel = assertNonEmpty(input.metricLabel, "metricLabel");
    }
    if (input.linkedObjectiveIds !== undefined) {
      const linkedObjectiveIds = [...new Set(input.linkedObjectiveIds)];

      for (const objectiveId of linkedObjectiveIds) {
        if (!objectiveExists(draft, objectiveId)) {
          throw new UniverseServiceError("Linked objective not found.", "not_found");
        }
      }

      habit.linkedObjectiveIds = linkedObjectiveIds;
      syncHabitLinks(draft, habit.id, linkedObjectiveIds);
    }
  });

  const habit = findHabit(workspace, habitId);

  if (!habit) {
    throw new UniverseServiceError("Habit not found.", "not_found");
  }

  return habit;
}

export async function deleteHabit(habitId: string) {
  await mutateWorkspace((draft) => {
    const index = draft.habits.findIndex((habit) => habit.id === habitId);

    if (index === -1) {
      throw new UniverseServiceError("Habit not found.", "not_found");
    }

    draft.habits.splice(index, 1);
    syncHabitLinks(draft, habitId, []);
  });
}
