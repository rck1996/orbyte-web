export type TaskState = "todo" | "in_progress" | "done" | "blocked";

export type HabitNode = {
  id: string;
  name: string;
  cadence: "daily" | "weekly" | "monthly";
  progress: number;
  metricLabel: string;
  streak: number;
  target: number;
  completedCount: number;
  description: string;
};

export type SubtaskNode = {
  id: string;
  name: string;
  progress: number;
  dueDate: string;
  metadata: string;
};

export type TaskNode = {
  id: string;
  name: string;
  state: TaskState;
  progress: number;
  dueDate: string;
  summary: string;
  subtasks: SubtaskNode[];
};

export type ObjectiveNode = {
  id: string;
  name: string;
  description: string;
  orbitRadius: number;
  progress: number;
  habits?: HabitNode[];
  tasks: TaskNode[];
};

export type GalaxyNode = {
  id: string;
  name: string;
  category: string;
  color: string;
  accent: string;
  progress: number;
  description: string;
  position: [number, number, number];
  objectives: ObjectiveNode[];
};

export type UniverseStats = {
  completion: string;
  focus: string;
  liveSystems: string;
};

export type UniverseData = {
  title: string;
  summary: string;
  stats: UniverseStats;
  galaxies: GalaxyNode[];
};
