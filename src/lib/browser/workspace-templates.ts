import type { HabitCadence } from "@/types/domain";

export type WorkspaceTemplate = {
  id: string; name: string; description: string; color: string; accent: string;
  category: string; objective: string; task?: string;
  habits: Array<{ name: string; cadence: HabitCadence; target: number; metricLabel: string }>;
};

export const workspaceTemplates: WorkspaceTemplate[] = [
  { id: "weekly-planning", name: "Planificación semanal", description: "Prioridades, revisión semanal y un ritmo diario.", color: "#38bdf8", accent: "#e0f2fe", category: "Semana", objective: "Semana enfocada", task: "Definir tres prioridades", habits: [{ name: "Revisión diaria", cadence: "daily", target: 5, metricLabel: "revisiones / semana" }] },
  { id: "personal-wellbeing", name: "Bienestar personal", description: "Una base simple para movimiento y recuperación.", color: "#34d399", accent: "#d1fae5", category: "Bienestar", objective: "Energía sostenible", habits: [{ name: "Movimiento diario", cadence: "daily", target: 5, metricLabel: "sesiones / semana" }, { name: "Revisión del sueño", cadence: "daily", target: 7, metricLabel: "registros / semana" }] },
  { id: "content-rhythm", name: "Ritmo de contenidos", description: "Un flujo recurrente para idear y publicar.", color: "#a78bfa", accent: "#ede9fe", category: "Contenido", objective: "Publicación constante", task: "Preparar próxima publicación", habits: [{ name: "Capturar ideas", cadence: "weekly", target: 5, metricLabel: "ideas / semana" }] },
];
