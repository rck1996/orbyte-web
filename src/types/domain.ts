export type TaskState = "todo" | "in_progress" | "done" | "blocked";

export type HabitCadence = "daily" | "weekly" | "monthly";

export type DomainSubtask = {
  id: string;
  name: string;
  progress: number;
  dueDate: string;
  metadata: string;
};

export type DomainTask = {
  id: string;
  name: string;
  state: TaskState;
  progress: number;
  dueDate: string;
  summary: string;
  subtasks: DomainSubtask[];
};

export type DomainObjective = {
  id: string;
  name: string;
  description: string;
  orbitRadius: number;
  habitIds: string[];
  tasks: DomainTask[];
};

export type DomainCategory = {
  id: string;
  name: string;
  category: string;
  color: string;
  accent: string;
  description: string;
  position: [number, number, number];
  objectives: DomainObjective[];
};

export type Habit = {
  id: string;
  name: string;
  description: string;
  cadence: HabitCadence;
  target: number;
  completedCount: number;
  streak: number;
  metricLabel: string;
  linkedObjectiveIds: string[];
  history?: HabitHistoryEntry[];
};

export type HabitHistoryEntry = {
  id: string;
  date: string;
  delta: number;
  completedCount: number;
};

export type WorkspaceDomain = {
  id: string;
  title: string;
  summary: string;
  categories: DomainCategory[];
  habits: Habit[];
};
