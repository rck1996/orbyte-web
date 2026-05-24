import "server-only";

import type { DomainCategory, DomainObjective, DomainTask, Habit, WorkspaceDomain } from "@/types/domain";
import type { GalaxyNode, ObjectiveNode, TaskNode, UniverseData } from "@/types/universe";

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function habitProgress(habit: Habit): number {
  if (habit.target <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((habit.completedCount / habit.target) * 100));
}

function taskToNode(task: DomainTask): TaskNode {
  return {
    id: task.id,
    name: task.name,
    state: task.state,
    progress: task.progress,
    dueDate: task.dueDate,
    summary: task.summary,
    subtasks: task.subtasks.map((subtask) => ({
      id: subtask.id,
      name: subtask.name,
      progress: subtask.progress,
      dueDate: subtask.dueDate,
      metadata: subtask.metadata,
    })),
  };
}

function objectiveProgress(objective: DomainObjective, habits: Habit[]): number {
  const taskAverage = average(objective.tasks.map((task) => task.progress));
  const linkedHabits = habits.filter((habit) => objective.habitIds.includes(habit.id));

  if (linkedHabits.length === 0) {
    return taskAverage;
  }

  const habitAverage = average(linkedHabits.map(habitProgress));
  return Math.round(taskAverage * 0.75 + habitAverage * 0.25);
}

function objectiveToNode(objective: DomainObjective, habits: Habit[]): ObjectiveNode {
  const linkedHabits = habits.filter((habit) => objective.habitIds.includes(habit.id));

  return {
    id: objective.id,
    name: objective.name,
    description: objective.description,
    orbitRadius: objective.orbitRadius,
    progress: objectiveProgress(objective, habits),
    habits: linkedHabits.map((habit) => ({
      id: habit.id,
      name: habit.name,
      cadence: habit.cadence,
      progress: habitProgress(habit),
      metricLabel: habit.metricLabel,
      streak: habit.streak,
      target: habit.target,
      completedCount: habit.completedCount,
      description: habit.description,
    })),
    tasks: objective.tasks.map(taskToNode),
  };
}

function categoryProgress(category: DomainCategory, habits: Habit[]): number {
  return average(category.objectives.map((objective) => objectiveProgress(objective, habits)));
}

function categoryToNode(category: DomainCategory, habits: Habit[]): GalaxyNode {
  return {
    id: category.id,
    name: category.name,
    category: category.category,
    color: category.color,
    accent: category.accent,
    progress: categoryProgress(category, habits),
    description: category.description,
    position: category.position,
    objectives: category.objectives.map((objective) => objectiveToNode(objective, habits)),
  };
}

export function workspaceToUniverse(workspace: WorkspaceDomain): UniverseData {
  const galaxies = workspace.categories.map((category) => categoryToNode(category, workspace.habits));
  const objectives = galaxies.flatMap((galaxy) => galaxy.objectives);
  const completion = average(galaxies.map((galaxy) => galaxy.progress));
  const liveObjectiveCount = objectives.filter((objective) => objective.progress < 100).length;

  return {
    title: workspace.title,
    summary: workspace.summary,
    stats: {
      completion: `${completion}%`,
      focus: `${liveObjectiveCount} live objectives`,
      liveSystems: `${galaxies.length} galaxies`,
    },
    galaxies,
  };
}
