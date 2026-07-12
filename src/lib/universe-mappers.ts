import type { DomainCategory, DomainObjective, DomainTask, Habit, WorkspaceDomain } from "@/types/domain";
import type { GalaxyNode, ObjectiveNode, TaskNode, UniverseData } from "@/types/universe";

function average(values: number[]): number {
  return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
}

function habitProgress(habit: Habit): number {
  return habit.target > 0 ? Math.min(100, Math.round((habit.completedCount / habit.target) * 100)) : 0;
}

function taskToNode(task: DomainTask): TaskNode {
  return { ...task, subtasks: task.subtasks.map((subtask) => ({ ...subtask })) };
}

function objectiveProgress(objective: DomainObjective, habits: Habit[]): number {
  const taskAverage = average(objective.tasks.map((task) => task.progress));
  const linkedHabits = habits.filter((habit) => objective.habitIds.includes(habit.id));
  if (!linkedHabits.length) return taskAverage;
  return Math.round(taskAverage * 0.75 + average(linkedHabits.map(habitProgress)) * 0.25);
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

function categoryToNode(category: DomainCategory, habits: Habit[]): GalaxyNode {
  return {
    id: category.id,
    name: category.name,
    category: category.category,
    color: category.color,
    accent: category.accent,
    progress: average(category.objectives.map((objective) => objectiveProgress(objective, habits))),
    description: category.description,
    position: category.position,
    objectives: category.objectives.map((objective) => objectiveToNode(objective, habits)),
  };
}

export function workspaceToUniverse(workspace: WorkspaceDomain): UniverseData {
  const galaxies = workspace.categories.map((category) => categoryToNode(category, workspace.habits));
  const objectives = galaxies.flatMap((galaxy) => galaxy.objectives);
  return {
    title: workspace.title,
    summary: workspace.summary,
    stats: {
      completion: `${average(galaxies.map((galaxy) => galaxy.progress))}%`,
      focus: `${objectives.filter((objective) => objective.progress < 100).length} objetivos activos`,
      liveSystems: `${galaxies.length} categorías`,
    },
    galaxies,
  };
}
