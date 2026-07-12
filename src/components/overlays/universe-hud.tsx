"use client";

import { useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  Compass,
  LayoutGrid,
  LoaderCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Waves,
} from "lucide-react";

import { FocusPanel } from "@/components/overlays/focus-panel";
import { GalaxyRail, type NavigationRailItem } from "@/components/overlays/galaxy-rail";
import { HabitsPanel } from "@/components/overlays/habits-panel";
import { ManagementPanel } from "@/components/overlays/management-panel";
import { TaskFocusModal } from "@/components/overlays/task-focus-modal";
import { applyWorkspaceTemplate, localWorkspaceRequest } from "@/lib/browser/workspace-storage";
import { workspaceTemplates } from "@/lib/browser/workspace-templates";
import { useUniverseStore } from "@/store/universe-store";
import type { WorkspaceDomain } from "@/types/domain";
import type { UniverseData } from "@/types/universe";

type Panel = "explore" | "habits" | "edit";

export function UniverseHud({
  universe,
  workspace,
  onRefreshData,
}: {
  universe: UniverseData;
  workspace: WorkspaceDomain;
  onRefreshData: () => Promise<void>;
}) {
  const [panel, setPanel] = useState<Panel>("explore");
  const [collapsed, setCollapsed] = useState(false);
  const selectedGalaxyId = useUniverseStore((state) => state.selectedGalaxyId);
  const selectedObjectiveId = useUniverseStore((state) => state.selectedObjectiveId);
  const selectedTaskId = useUniverseStore((state) => state.selectedTaskId);
  const selectedSubtaskId = useUniverseStore((state) => state.selectedSubtaskId);
  const selectGalaxy = useUniverseStore((state) => state.selectGalaxy);
  const selectObjective = useUniverseStore((state) => state.selectObjective);
  const selectTask = useUniverseStore((state) => state.selectTask);
  const selectSubtask = useUniverseStore((state) => state.selectSubtask);
  const stepOut = useUniverseStore((state) => state.stepOut);
  const zoomToMap = useUniverseStore((state) => state.zoomToMap);

  const galaxy = universe.galaxies.find((item) => item.id === selectedGalaxyId) ?? null;
  const objective = galaxy?.objectives.find((item) => item.id === selectedObjectiveId) ?? null;
  const task = objective?.tasks.find((item) => item.id === selectedTaskId) ?? null;
  const isEmpty = workspace.categories.length === 0;

  const rail = useMemo(() => {
    if (task) {
      return {
        label: "Subtareas",
        activeId: selectedSubtaskId,
        items: task.subtasks.map((item): NavigationRailItem => ({
          id: item.id,
          title: item.name,
          subtitle: "Subtarea",
          description: item.metadata,
          accent: item.progress === 100 ? "#34d399" : "#7dd3fc",
          meta: `${item.progress}%`,
        })),
        select: selectSubtask,
      };
    }
    if (objective) {
      return {
        label: "Tareas",
        activeId: selectedTaskId,
        items: objective.tasks.map((item): NavigationRailItem => ({
          id: item.id,
          title: item.name,
          subtitle: item.state === "done" ? "Completada" : "Tarea",
          description: item.summary,
          accent: item.state === "done" ? "#34d399" : "#fbbf24",
          meta: `${item.progress}%`,
        })),
        select: selectTask,
      };
    }
    if (galaxy) {
      return {
        label: "Objetivos",
        activeId: selectedObjectiveId,
        items: galaxy.objectives.map((item): NavigationRailItem => ({
          id: item.id,
          title: item.name,
          subtitle: "Objetivo",
          description: item.description,
          accent: galaxy.accent,
          meta: `${item.progress}%`,
        })),
        select: selectObjective,
      };
    }
    return {
      label: "Categorías",
      activeId: selectedGalaxyId,
      items: universe.galaxies.map((item): NavigationRailItem => ({
        id: item.id,
        title: item.name,
        subtitle: item.category,
        description: item.description,
        accent: item.accent,
        meta: `${item.progress}%`,
      })),
      select: selectGalaxy,
    };
  }, [galaxy, objective, selectGalaxy, selectObjective, selectSubtask, selectTask, selectedGalaxyId, selectedObjectiveId, selectedSubtaskId, selectedTaskId, task, universe.galaxies]);

  const path = [galaxy?.name, objective?.name, task?.name].filter(Boolean) as string[];

  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-20">
        <header data-universe-ui="true" className="pointer-events-auto absolute left-12 right-12 top-12 flex items-center justify-between gap-12 md:left-16 md:right-16 md:top-16">
          <button
            type="button"
            onClick={() => { zoomToMap(); setPanel("explore"); setCollapsed(false); }}
            className="group inline-flex items-center gap-10 rounded-full border border-white/10 bg-slate-950/72 px-12 py-8 text-left shadow-[0_16px_50px_rgba(2,6,23,0.3)] backdrop-blur-xl transition hover:bg-slate-950/88"
          >
            <span className="grid size-28 place-items-center rounded-full bg-[linear-gradient(135deg,#7dd3fc,#a78bfa)] text-slate-950">
              <Sparkles className="size-14" />
            </span>
            <span>
              <span className="block text-xs font-semibold tracking-[0.04em] text-white">Orbyte</span>
              <span className="hidden text-[10px] text-slate-400 sm:block">Tu universo, a tu ritmo</span>
            </span>
          </button>
          <div className="hidden items-center gap-6 rounded-full border border-emerald-300/10 bg-slate-950/62 px-10 py-7 text-[10px] text-slate-400 backdrop-blur-xl sm:flex">
            <ShieldCheck className="size-13 text-emerald-300" />
            Guardado solo en este navegador
          </div>
        </header>

        {isEmpty ? (
          <EmptyWorkspace onRefreshData={onRefreshData} />
        ) : (
          <AnimatePresence mode="wait">
            {collapsed ? (
              <motion.button
                key="open-panel"
                type="button"
                data-universe-ui="true"
                onClick={() => setCollapsed(false)}
                className="pointer-events-auto absolute bottom-16 left-12 inline-flex items-center gap-8 rounded-full border border-white/10 bg-slate-950/78 px-12 py-9 text-xs text-white shadow-[0_18px_60px_rgba(2,6,23,0.36)] backdrop-blur-xl md:bottom-auto md:left-16 md:top-80"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
              >
                <PanelLeftOpen className="size-16" /> Abrir navegación
              </motion.button>
            ) : (
              <motion.aside
                key="main-panel"
                data-universe-ui="true"
                className="pointer-events-auto absolute inset-x-12 bottom-12 flex max-h-[58vh] flex-col overflow-hidden rounded-[26px] border border-white/10 bg-slate-950/82 p-10 shadow-[0_28px_100px_rgba(2,6,23,0.46)] backdrop-blur-2xl md:inset-x-auto md:bottom-16 md:left-16 md:top-80 md:max-h-none md:w-[372px] md:p-12"
                initial={{ opacity: 0, x: -12, y: 8 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center justify-between gap-10 border-b border-white/8 pb-10">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-sky-200/70">Ahora estás en</p>
                    <p className="mt-4 truncate text-sm font-medium text-white">{path.at(-1) ?? "Tu universo"}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    {path.length ? (
                      <button type="button" onClick={stepOut} className="grid size-32 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-slate-200 transition hover:bg-white/[0.09]" aria-label="Volver un nivel">
                        <ChevronLeft className="size-16" />
                      </button>
                    ) : null}
                    <button type="button" onClick={() => setCollapsed(true)} className="grid size-32 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-slate-200 transition hover:bg-white/[0.09]" aria-label="Ocultar navegación">
                      <PanelLeftClose className="size-16" />
                    </button>
                  </div>
                </div>

                {path.length ? (
                  <div className="flex gap-5 overflow-hidden py-8 text-[10px] text-slate-500">
                    <button type="button" onClick={zoomToMap} className="shrink-0 transition hover:text-white">Universo</button>
                    {path.map((item) => <span key={item} className="truncate">/ {item}</span>)}
                  </div>
                ) : null}

                <nav className="grid grid-cols-3 gap-6 py-8" aria-label="Secciones principales">
                  <PanelTab active={panel === "explore"} icon={Compass} label="Explorar" onClick={() => setPanel("explore")} />
                  <PanelTab active={panel === "habits"} icon={Waves} label="Hábitos" onClick={() => setPanel("habits")} />
                  <PanelTab active={panel === "edit"} icon={SlidersHorizontal} label="Editar" onClick={() => setPanel("edit")} />
                </nav>

                <div className="min-h-0 flex-1 overflow-y-auto pr-2" style={{ touchAction: "pan-y" }}>
                  {panel === "explore" ? (
                    <div className="grid gap-8">
                      <FocusPanel universe={universe} workspace={workspace} selectedGalaxyId={selectedGalaxyId} selectedObjectiveId={selectedObjectiveId} selectedTaskId={selectedTaskId} selectedSubtaskId={selectedSubtaskId} onRefreshData={onRefreshData} />
                      <GalaxyRail label={rail.label} items={rail.items} activeId={rail.activeId} onSelect={rail.select} condensed />
                    </div>
                  ) : null}
                  {panel === "habits" ? <HabitsPanel workspace={workspace} selectedGalaxyId={selectedGalaxyId} selectedObjectiveId={selectedObjectiveId} onRefreshData={onRefreshData} /> : null}
                  {panel === "edit" ? <ManagementPanel universe={universe} workspace={workspace} selectedGalaxyId={selectedGalaxyId} selectedObjectiveId={selectedObjectiveId} selectedTaskId={selectedTaskId} selectedSubtaskId={selectedSubtaskId} onRefreshData={onRefreshData} /> : null}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        )}
      </div>

      <TaskFocusModal workspace={workspace} selectedGalaxyId={selectedGalaxyId} selectedObjectiveId={selectedObjectiveId} selectedTaskId={selectedTaskId} selectedSubtaskId={selectedSubtaskId} onRefreshData={onRefreshData} />
    </>
  );
}

function PanelTab({ active, icon: Icon, label, onClick }: { active: boolean; icon: typeof Compass; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={`flex items-center justify-center gap-6 rounded-[12px] border px-8 py-8 text-[10px] font-medium transition ${active ? "border-sky-300/20 bg-sky-400/12 text-sky-100" : "border-white/8 bg-white/[0.03] text-slate-400 hover:bg-white/[0.07] hover:text-white"}`}>
      <Icon className="size-13" /> {label}
    </button>
  );
}

function EmptyWorkspace({ onRefreshData }: { onRefreshData: () => Promise<void> }) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<void>) {
    startTransition(() => void action().catch((issue: unknown) => setError(issue instanceof Error ? issue.message : "No pudimos guardar el cambio.")));
  }

  return (
    <motion.main data-universe-ui="true" className="pointer-events-auto absolute inset-x-12 top-1/2 mx-auto w-auto max-w-[620px] -translate-y-1/2 overflow-hidden rounded-[30px] border border-white/12 bg-slate-950/78 p-16 shadow-[0_30px_120px_rgba(2,6,23,0.5)] backdrop-blur-2xl md:p-24" initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(90deg,rgba(56,189,248,0.2),rgba(167,139,250,0.14),transparent)]" />
      <div className="relative">
        <div className="flex size-40 items-center justify-center rounded-[14px] border border-sky-300/20 bg-sky-400/12 text-sky-100"><LayoutGrid className="size-18" /></div>
        <p className="mt-14 text-[10px] uppercase tracking-[0.2em] text-sky-200/70">Empieza por lo importante</p>
        <h1 className="mt-8 max-w-lg text-3xl leading-[1.02] font-semibold tracking-[-0.055em] text-white md:text-5xl">Construye tu primer sistema.</h1>
        <p className="mt-12 max-w-xl text-sm leading-[1.7] text-slate-300 md:text-base">Una categoría agrupa un área de tu vida o trabajo. Dentro crearás objetivos, tareas y hábitos, en ese orden.</p>

        <div className="mt-16 flex gap-8 rounded-[18px] border border-white/10 bg-white/[0.04] p-6">
          <input value={name} onChange={(event) => setName(event.target.value)} onKeyDown={(event) => {
            if (event.key === "Enter" && name.trim()) {
              const button = event.currentTarget.nextElementSibling;
              if (button instanceof HTMLElement) button.click();
            }
          }} placeholder="Ej: Trabajo, Salud, Proyecto personal" className="min-w-0 flex-1 bg-transparent px-8 py-7 text-sm text-white outline-none placeholder:text-slate-500" autoFocus />
          <button type="button" disabled={!name.trim() || isPending} onClick={() => run(async () => { setError(null); await localWorkspaceRequest("/api/categories", { method: "POST", body: JSON.stringify({ name, category: "Personal", color: "#38bdf8", accent: "#bae6fd", description: `${name} reúne tus objetivos y acciones principales.` }) }); await onRefreshData(); })} className="inline-flex items-center gap-6 rounded-[13px] bg-sky-300 px-12 py-8 text-xs font-semibold text-slate-950 transition hover:bg-sky-200 disabled:opacity-40">
            {isPending ? <LoaderCircle className="size-14 animate-spin" /> : <Plus className="size-14" />} Crear
          </button>
        </div>

        <div className="my-14 flex items-center gap-10 text-[10px] uppercase tracking-[0.16em] text-slate-500"><span className="h-px flex-1 bg-white/8" />o usa una plantilla<span className="h-px flex-1 bg-white/8" /></div>
        <div className="grid gap-8 sm:grid-cols-3">
          {workspaceTemplates.map((template) => (
            <button key={template.id} type="button" disabled={isPending} onClick={() => run(async () => { setError(null); applyWorkspaceTemplate(template.id); await onRefreshData(); })} className="group rounded-[18px] border border-white/8 bg-white/[0.03] p-12 text-left transition hover:-translate-y-1 hover:border-white/16 hover:bg-white/[0.07] disabled:opacity-50">
              <span className="block size-10 rounded-full" style={{ backgroundColor: template.color, boxShadow: `0 0 24px ${template.color}66` }} />
              <span className="mt-10 block text-sm font-medium text-white">{template.name}</span>
              <span className="mt-5 block text-xs leading-[1.5] text-slate-400">{template.description}</span>
            </button>
          ))}
        </div>
        {error ? <p className="mt-10 rounded-[14px] border border-rose-300/20 bg-rose-400/10 px-10 py-8 text-sm text-rose-100">{error}</p> : null}
      </div>
    </motion.main>
  );
}
