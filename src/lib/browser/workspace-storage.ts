"use client";

import { workspaceToUniverse } from "@/lib/universe-mappers";
import { workspaceTemplates } from "@/lib/browser/workspace-templates";
import type { DomainCategory, DomainObjective, DomainSubtask, DomainTask, Habit, WorkspaceDomain } from "@/types/domain";

export const WORKSPACE_STORAGE_KEY = "orbyte.workspace.v1";

export function createEmptyWorkspace(): WorkspaceDomain {
  return { id: "workspace-local", title: "Mi universo", summary: "Organiza tus áreas, objetivos y acciones en un sistema visual que crece contigo.", categories: [], habits: [] };
}

const newId = () => crypto.randomUUID();

function normalize(workspace: WorkspaceDomain): WorkspaceDomain {
  const emptySummary = "Tu espacio personal comienza vacío. Crea una categoría o usa una plantilla cuando quieras.";
  return {
    ...workspace,
    summary: workspace.summary === emptySummary ? createEmptyWorkspace().summary : workspace.summary,
    categories: Array.isArray(workspace.categories) ? workspace.categories : [],
    habits: Array.isArray(workspace.habits) ? workspace.habits.map((habit) => ({ ...habit, history: habit.history ?? [] })) : [],
  };
}

export function readLocalWorkspace(): WorkspaceDomain {
  const raw = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);
  if (!raw) return createEmptyWorkspace();
  try { return normalize(JSON.parse(raw) as WorkspaceDomain); } catch { return createEmptyWorkspace(); }
}

export function writeLocalWorkspace(workspace: WorkspaceDomain) {
  window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(workspace));
  window.dispatchEvent(new CustomEvent("orbyte:workspace-changed"));
  return workspace;
}

export function applyWorkspaceTemplate(templateId: string) {
  const template = workspaceTemplates.find((item) => item.id === templateId);
  if (!template) throw new Error("Template not found.");
  const workspace = readLocalWorkspace();
  const objectiveId = newId();
  const habitIds = template.habits.map(() => newId());
  const tasks: DomainTask[] = template.task ? [{ id: newId(), name: template.task, state: "todo", progress: 0, dueDate: "Esta semana", summary: template.description, subtasks: [] }] : [];
  const objective: DomainObjective = { id: objectiveId, name: template.objective, description: template.description, orbitRadius: 4, habitIds, tasks };
  workspace.categories.push({ id: newId(), name: template.category, category: "Plantilla", color: template.color, accent: template.accent, description: template.description, position: [0, 0, 0], objectives: [objective] });
  workspace.habits.push(...template.habits.map((habit, index) => ({ id: habitIds[index], ...habit, description: template.description, completedCount: 0, streak: 0, linkedObjectiveIds: [objectiveId], history: [] })));
  return writeLocalWorkspace(workspace);
}

function findObjective(workspace: WorkspaceDomain, targetId: string) {
  for (const category of workspace.categories) { const objective = category.objectives.find((item) => item.id === targetId); if (objective) return { category, objective }; }
  return null;
}

function findTask(workspace: WorkspaceDomain, targetId: string) {
  for (const category of workspace.categories) for (const objective of category.objectives) { const task = objective.tasks.find((item) => item.id === targetId); if (task) return { objective, task }; }
  return null;
}

function findSubtask(workspace: WorkspaceDomain, targetId: string) {
  for (const category of workspace.categories) for (const objective of category.objectives) for (const task of objective.tasks) { const subtask = task.subtasks.find((item) => item.id === targetId); if (subtask) return { task, subtask }; }
  return null;
}

function parseBody(init?: RequestInit) {
  return init?.body && typeof init.body === "string" ? JSON.parse(init.body) as Record<string, unknown> : {};
}

function text(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label} is required.`);
  return value.trim();
}

export async function localWorkspaceRequest(path: string, init?: RequestInit): Promise<unknown> {
  const workspace = readLocalWorkspace();
  const input = parseBody(init);
  const method = init?.method?.toUpperCase() ?? "GET";
  const [resource, targetId] = path.replace(/^\/api\//, "").split("/");
  let result: unknown = null;

  if (method === "POST") {
    if (resource === "categories") {
      const item: DomainCategory = { id: newId(), name: text(input.name, "name"), category: String(input.category ?? "Custom"), color: String(input.color ?? "#7dd3fc"), accent: String(input.accent ?? "#e0f2fe"), description: String(input.description ?? ""), position: [0, 0, 0], objectives: [] };
      workspace.categories.push(item); result = item;
    } else if (resource === "objectives") {
      const parent = workspace.categories.find((item) => item.id === input.categoryId); if (!parent) throw new Error("Category not found.");
      const item: DomainObjective = { id: newId(), name: text(input.name, "name"), description: String(input.description ?? ""), orbitRadius: Number(input.orbitRadius) || 4, habitIds: [], tasks: [] };
      parent.objectives.push(item); result = item;
    } else if (resource === "tasks") {
      const parent = findObjective(workspace, String(input.objectiveId)); if (!parent) throw new Error("Objective not found.");
      const item: DomainTask = { id: newId(), name: text(input.name, "name"), state: (input.state as DomainTask["state"]) ?? "todo", progress: Number(input.progress) || 0, dueDate: String(input.dueDate ?? "Planned"), summary: String(input.summary ?? ""), subtasks: [] };
      parent.objective.tasks.push(item); result = item;
    } else if (resource === "subtasks") {
      const parent = findTask(workspace, String(input.taskId)); if (!parent) throw new Error("Task not found.");
      const item: DomainSubtask = { id: newId(), name: text(input.name, "name"), progress: Number(input.progress) || 0, dueDate: String(input.dueDate ?? "Planned"), metadata: String(input.metadata ?? "") };
      parent.task.subtasks.push(item); result = item;
    } else if (resource === "habits") {
      const linkedObjectiveIds = Array.isArray(input.linkedObjectiveIds) ? input.linkedObjectiveIds.map(String) : [];
      const item: Habit = { id: newId(), name: text(input.name, "name"), description: String(input.description ?? ""), cadence: (input.cadence as Habit["cadence"]) ?? "daily", target: Math.max(1, Number(input.target) || 1), completedCount: 0, streak: 0, metricLabel: String(input.metricLabel ?? "veces"), linkedObjectiveIds, history: [] };
      workspace.habits.push(item); for (const objectiveId of linkedObjectiveIds) { const parent = findObjective(workspace, objectiveId); if (parent) parent.objective.habitIds.push(item.id); } result = item;
    }
  } else if (targetId) {
    const match = resource === "categories" ? workspace.categories.find((item) => item.id === targetId) : resource === "objectives" ? findObjective(workspace, targetId)?.objective : resource === "tasks" ? findTask(workspace, targetId)?.task : resource === "subtasks" ? findSubtask(workspace, targetId)?.subtask : workspace.habits.find((item) => item.id === targetId);
    if (!match) throw new Error("Item not found.");
    if (method === "PATCH") {
      const previousCount = "completedCount" in match ? Number(match.completedCount) : null;
      Object.assign(match, input);
      if (previousCount !== null && input.completedCount !== undefined && Number(input.completedCount) !== previousCount) { const habit = match as Habit; habit.history = [...(habit.history ?? []), { id: newId(), date: new Date().toISOString(), delta: Number(input.completedCount) - previousCount, completedCount: Number(input.completedCount) }]; }
      result = match;
    } else if (method === "DELETE") {
      if (resource === "categories") { const removed = workspace.categories.find((item) => item.id === targetId); const objectiveIds = removed?.objectives.map((item) => item.id) ?? []; workspace.categories = workspace.categories.filter((item) => item.id !== targetId); workspace.habits = workspace.habits.filter((habit) => !habit.linkedObjectiveIds.some((id) => objectiveIds.includes(id))); }
      if (resource === "objectives") { for (const category of workspace.categories) category.objectives = category.objectives.filter((item) => item.id !== targetId); workspace.habits = workspace.habits.filter((habit) => !habit.linkedObjectiveIds.includes(targetId)); }
      if (resource === "tasks") for (const category of workspace.categories) for (const objective of category.objectives) objective.tasks = objective.tasks.filter((item) => item.id !== targetId);
      if (resource === "subtasks") for (const category of workspace.categories) for (const objective of category.objectives) for (const task of objective.tasks) task.subtasks = task.subtasks.filter((item) => item.id !== targetId);
      if (resource === "habits") { workspace.habits = workspace.habits.filter((item) => item.id !== targetId); for (const category of workspace.categories) for (const objective of category.objectives) objective.habitIds = objective.habitIds.filter((item) => item !== targetId); }
    }
  }

  writeLocalWorkspace(workspace);
  return result;
}

export function localWorkspaceSnapshot() {
  const workspace = readLocalWorkspace();
  return { workspace, universe: workspaceToUniverse(workspace) };
}
