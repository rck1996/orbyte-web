"use client";

import { useState, useTransition, type ReactNode } from "react";
import { motion } from "framer-motion";
import { LoaderCircle, Plus, RefreshCw, Trash2 } from "lucide-react";
import { applyWorkspaceTemplate, localWorkspaceRequest } from "@/lib/browser/workspace-storage";
import { workspaceTemplates } from "@/lib/browser/workspace-templates";

import type { WorkspaceDomain } from "@/types/domain";
import type { UniverseData } from "@/types/universe";

type Props = {
  universe: UniverseData;
  workspace: WorkspaceDomain;
  selectedGalaxyId: string | null;
  selectedObjectiveId: string | null;
  selectedTaskId: string | null;
  selectedSubtaskId: string | null;
  onRefreshData: () => Promise<void>;
};

async function request(path: string, init?: RequestInit) {
  return localWorkspaceRequest(path, init);
}

export function ManagementPanel({
  universe,
  workspace,
  selectedGalaxyId,
  selectedObjectiveId,
  selectedTaskId,
  selectedSubtaskId,
  onRefreshData,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [categoryName, setCategoryName] = useState("");
  const [objectiveName, setObjectiveName] = useState("");
  const [taskName, setTaskName] = useState("");
  const [subtaskName, setSubtaskName] = useState("");

  const category =
    workspace.categories.find((item) => item.id === selectedGalaxyId) ?? null;
  const objective =
    category?.objectives.find((item) => item.id === selectedObjectiveId) ?? null;
  const task = objective?.tasks.find((item) => item.id === selectedTaskId) ?? null;
  const subtask = task?.subtasks.find((item) => item.id === selectedSubtaskId) ?? null;

  async function refreshAll() {
    await onRefreshData();
  }

  function run(action: () => Promise<void>) {
    startTransition(() => {
      void action().catch((issue: unknown) => {
        setError(issue instanceof Error ? issue.message : "Unexpected error.");
      });
    });
  }

  return (
    <motion.aside
      className="pointer-events-auto relative w-full max-w-full overflow-hidden rounded-[20px] border border-white/10 bg-slate-950/50 p-12 shadow-[0_18px_80px_rgba(2,6,23,0.24)] backdrop-blur-2xl md:max-w-[360px]"
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-violet-300/14 via-slate-200/6 to-transparent" />
      <div className="flex items-center justify-between gap-12 border-b border-white/8 pb-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Estructura</p>
          <p className="mt-4 text-sm text-slate-300">Edita categorías, objetivos, tareas y subtareas.</p>
        </div>
        <button
          type="button"
          onClick={() => run(refreshAll)}
          className="inline-flex items-center gap-6 rounded-full border border-white/10 bg-white/[0.04] px-10 py-6 text-xs text-slate-200 transition hover:bg-white/[0.08]"
        >
          {isPending ? <LoaderCircle className="size-14 animate-spin" /> : <RefreshCw className="size-14" />}
          Actualizar
        </button>
      </div>

      <div className="mt-12 grid max-h-[46vh] gap-12 overflow-y-auto pr-4 md:max-h-[58vh]" style={{ touchAction: "pan-y" }}>
        <Section title="Plantillas recurrentes">
          <p className="text-xs leading-[1.6] text-slate-400">Se aplican solo cuando las eliges; el espacio comienza vacío.</p>
          <div className="grid gap-8">
            {workspaceTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => run(async () => { setError(null); applyWorkspaceTemplate(template.id); await refreshAll(); })}
                className="rounded-[14px] border border-white/10 bg-white/[0.04] px-10 py-8 text-left transition hover:bg-white/[0.08]"
              >
                <span className="block text-sm text-white">{template.name}</span>
                <span className="mt-4 block text-xs leading-[1.5] text-slate-400">{template.description}</span>
              </button>
            ))}
          </div>
        </Section>
        <Section title="Categorías">
          <p className="text-xs text-slate-400">
            {universe.stats.liveSystems} en la vista actual
          </p>
          <InlineInput
            value={categoryName}
            onChange={setCategoryName}
            placeholder="Nueva categoría"
            buttonLabel="Crear"
            onSubmit={() =>
              run(async () => {
                setError(null);
                await request("/api/categories", {
                  method: "POST",
                  body: JSON.stringify({
                    name: categoryName,
                    category: "Personal",
                    color: "#7dd3fc",
                    accent: "#e0f2fe",
                    description: `${categoryName} reúne tus objetivos principales.`,
                    position: [0, 0, 0],
                  }),
                });
                setCategoryName("");
                await refreshAll();
              })
            }
          />
          <p className="text-xs text-slate-400">
            {workspace.categories.length} categorías guardadas
          </p>
        </Section>

        {category ? (
          <Section title="Categoría seleccionada">
            <EditableCard
              label={category.name}
              description={category.description}
              meta={`${category.objectives.length} objetivos`}
              onDelete={() =>
                run(async () => {
                  setError(null);
                  await request(`/api/categories/${category.id}`, { method: "DELETE" });
                  await refreshAll();
                })
              }
            />
            <EditFields
              key={category.id}
              initialLabel={category.name}
              initialDescription={category.description}
              onSave={(label, description) =>
                run(async () => {
                  setError(null);
                  await request(`/api/categories/${category.id}`, {
                    method: "PATCH",
                    body: JSON.stringify({
                      name: label,
                      description,
                    }),
                  });
                  await refreshAll();
                })
              }
            />
            <InlineInput
              value={objectiveName}
              onChange={setObjectiveName}
              placeholder="Nuevo objetivo"
              buttonLabel="Crear"
              onSubmit={() =>
                run(async () => {
                  setError(null);
                  await request("/api/objectives", {
                    method: "POST",
                    body: JSON.stringify({
                      categoryId: category.id,
                      name: objectiveName,
                      description: `Resultado que quieres alcanzar: ${objectiveName}.`,
                      orbitRadius: 4 + category.objectives.length * 1.4,
                      habitIds: [],
                    }),
                  });
                  setObjectiveName("");
                  await refreshAll();
                })
              }
            />
          </Section>
        ) : null}

        {objective ? (
          <Section title="Objetivo seleccionado">
            <EditableCard
              label={objective.name}
              description={objective.description}
              meta={`${objective.tasks.length} tareas`}
              onDelete={() =>
                run(async () => {
                  setError(null);
                  await request(`/api/objectives/${objective.id}`, { method: "DELETE" });
                  await refreshAll();
                })
              }
            />
            <EditFields
              key={objective.id}
              initialLabel={objective.name}
              initialDescription={objective.description}
              onSave={(label, description) =>
                run(async () => {
                  setError(null);
                  await request(`/api/objectives/${objective.id}`, {
                    method: "PATCH",
                    body: JSON.stringify({
                      name: label,
                      description,
                    }),
                  });
                  await refreshAll();
                })
              }
            />
            <InlineInput
              value={taskName}
              onChange={setTaskName}
              placeholder="Nueva tarea"
              buttonLabel="Crear"
              onSubmit={() =>
                run(async () => {
                  setError(null);
                  await request("/api/tasks", {
                    method: "POST",
                    body: JSON.stringify({
                      objectiveId: objective.id,
                      name: taskName,
                      state: "todo",
                      progress: 0,
                      dueDate: "Sin fecha",
                      summary: `Acción necesaria: ${taskName}.`,
                    }),
                  });
                  setTaskName("");
                  await refreshAll();
                })
              }
            />
          </Section>
        ) : null}

        {task ? (
          <Section title="Tarea seleccionada">
            <EditableCard
              label={task.name}
              description={task.summary}
              meta={`${task.progress}% completado`}
              onDelete={() =>
                run(async () => {
                  setError(null);
                  await request(`/api/tasks/${task.id}`, { method: "DELETE" });
                  await refreshAll();
                })
              }
            />
            <EditFields
              key={task.id}
              initialLabel={task.name}
              initialDescription={task.summary}
              onSave={(label, description) =>
                run(async () => {
                  setError(null);
                  await request(`/api/tasks/${task.id}`, {
                    method: "PATCH",
                    body: JSON.stringify({
                      name: label,
                      summary: description,
                    }),
                  });
                  await refreshAll();
                })
              }
            />
            <InlineInput
              value={subtaskName}
              onChange={setSubtaskName}
              placeholder="Nueva subtarea"
              buttonLabel="Crear"
              onSubmit={() =>
                run(async () => {
                  setError(null);
                  await request("/api/subtasks", {
                    method: "POST",
                    body: JSON.stringify({
                      taskId: task.id,
                      name: subtaskName,
                      progress: 0,
                      dueDate: "Sin fecha",
                      metadata: `Paso concreto: ${subtaskName}.`,
                    }),
                  });
                  setSubtaskName("");
                  await refreshAll();
                })
              }
            />
          </Section>
        ) : null}

        {subtask ? (
          <Section title="Subtarea seleccionada">
            <EditableCard
              label={subtask.name}
              description={subtask.metadata}
              meta={`${subtask.progress}% completado`}
              onDelete={() =>
                run(async () => {
                  setError(null);
                  await request(`/api/subtasks/${subtask.id}`, { method: "DELETE" });
                  await refreshAll();
                })
              }
            />
            <EditFields
              key={subtask.id}
              initialLabel={subtask.name}
              initialDescription={subtask.metadata}
              onSave={(label, description) =>
                run(async () => {
                  setError(null);
                  await request(`/api/subtasks/${subtask.id}`, {
                    method: "PATCH",
                    body: JSON.stringify({
                      name: label,
                      metadata: description,
                    }),
                  });
                  await refreshAll();
                })
              }
            />
          </Section>
        ) : null}

        <Section title="Cómo navegar">
          <p className="text-sm leading-[1.6] text-slate-300">
            Arrastra el espacio vacío para mover el mapa. Los hábitos están en su propia sección para mantener esta vista enfocada en la estructura.
          </p>
        </Section>

        {error ? (
          <div className="rounded-[16px] border border-rose-400/20 bg-rose-500/10 px-12 py-10 text-sm text-rose-200">
            {error}
          </div>
        ) : null}
      </div>
    </motion.aside>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-8 rounded-[18px] border border-white/8 bg-white/[0.03] p-12">
      <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">{title}</p>
      {children}
    </section>
  );
}

function EditFields({
  initialLabel,
  initialDescription,
  onSave,
}: {
  initialLabel: string;
  initialDescription: string;
  onSave: (label: string, description: string) => void;
}) {
  const [labelValue, setLabelValue] = useState(initialLabel);
  const [descriptionValue, setDescriptionValue] = useState(initialDescription);

  return (
    <div className="grid gap-8">
      <input
        value={labelValue}
        onChange={(event) => setLabelValue(event.target.value)}
        placeholder="Nombre"
        className="rounded-[14px] border border-white/10 bg-slate-950/70 px-10 py-8 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-300/30"
      />
      <textarea
        value={descriptionValue}
        onChange={(event) => setDescriptionValue(event.target.value)}
        placeholder="Descripción"
        rows={3}
        className="resize-none rounded-[14px] border border-white/10 bg-slate-950/70 px-10 py-8 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-300/30"
      />
      <button
        type="button"
        onClick={() => onSave(labelValue, descriptionValue)}
        className="rounded-[14px] border border-white/10 bg-white/[0.05] px-10 py-8 text-xs text-slate-100 transition hover:bg-white/[0.09]"
      >
        Guardar cambios
      </button>
    </div>
  );
}

function InlineInput({
  value,
  onChange,
  placeholder,
  buttonLabel,
  onSubmit,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  buttonLabel: string;
  onSubmit: () => void;
}) {
  return (
    <div className="flex items-center gap-8">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-[14px] border border-white/10 bg-slate-950/70 px-10 py-8 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-300/30"
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={!value.trim()}
        className="inline-flex items-center gap-6 rounded-[14px] border border-white/10 bg-white/[0.05] px-10 py-8 text-xs text-slate-100 transition hover:bg-white/[0.09] disabled:opacity-40"
      >
        <Plus className="size-14" />
        {buttonLabel}
      </button>
    </div>
  );
}

function EditableCard({
  label,
  description,
  meta,
  onDelete,
}: {
  label: string;
  description: string;
  meta: string;
  onDelete: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  return (
    <div className="rounded-[16px] border border-white/8 bg-white/[0.03] p-10">
      <div className="flex items-start justify-between gap-12">
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          <p className="mt-4 text-xs text-slate-400">{meta}</p>
        </div>
        <button
          type="button"
          onClick={() => confirming ? onDelete() : setConfirming(true)}
          className="inline-flex items-center gap-6 rounded-full border border-rose-400/20 bg-rose-500/10 px-8 py-6 text-xs text-rose-200 transition hover:bg-rose-500/16"
        >
          <Trash2 className="size-14" />
          {confirming ? "Confirmar" : "Eliminar"}
        </button>
      </div>
      <p className="mt-8 text-sm leading-[1.6] text-slate-300">{description}</p>
    </div>
  );
}
