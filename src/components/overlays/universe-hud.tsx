"use client";

import { motion } from "framer-motion";
import { Compass, Orbit, Sparkles } from "lucide-react";

import { FocusPanel } from "@/components/overlays/focus-panel";
import { GalaxyRail } from "@/components/overlays/galaxy-rail";
import { useUniverseStore } from "@/store/universe-store";
import type { UniverseData } from "@/types/universe";

export function UniverseHud({ universe }: { universe: UniverseData }) {
  const selectedGalaxyId = useUniverseStore((state) => state.selectedGalaxyId);
  const selectedObjectiveId = useUniverseStore((state) => state.selectedObjectiveId);
  const selectedTaskId = useUniverseStore((state) => state.selectedTaskId);
  const selectGalaxy = useUniverseStore((state) => state.selectGalaxy);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-12 md:p-24">
      <div className="grid gap-12 xl:grid-cols-[1fr_auto] xl:items-start">
        <motion.div
          className="pointer-events-auto max-w-[720px] rounded-[28px] border border-white/10 bg-slate-950/50 p-16 shadow-[0_18px_80px_rgba(2,6,23,0.34)] backdrop-blur-2xl md:p-24"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-wrap items-center gap-12">
            <div className="flex size-48 items-center justify-center rounded-full border border-white/10 bg-white/8 text-white">
              <Orbit className="size-20" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Spatial productivity system
              </p>
              <h1 className="mt-8 text-3xl leading-[1.02] font-semibold tracking-[-0.05em] text-white md:text-5xl">
                {universe.title}
              </h1>
            </div>
          </div>
          <p className="mt-16 max-w-3xl text-sm leading-[1.7] text-slate-300 md:text-base">
            {universe.summary}
          </p>
          <div className="mt-16 grid gap-12 md:grid-cols-3">
            <HudStat label="Completion field" value={universe.stats.completion} />
            <HudStat label="Primary focus" value={universe.stats.focus} />
            <HudStat label="Live systems" value={universe.stats.liveSystems} />
          </div>
        </motion.div>

        <motion.div
          className="pointer-events-auto flex items-center gap-12 self-start rounded-[20px] border border-white/10 bg-slate-950/52 px-16 py-12 text-sm text-slate-200 backdrop-blur-xl"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: 0.04 }}
        >
          <Compass className="size-16 text-sky-300" aria-hidden="true" />
          <span>Click a galaxy, then dive into objectives and task planets.</span>
        </motion.div>
      </div>

      <div className="grid gap-12 xl:grid-cols-[1fr_auto] xl:items-end">
        <div className="pointer-events-auto">
          <FocusPanel
            universe={universe}
            selectedGalaxyId={selectedGalaxyId}
            selectedObjectiveId={selectedObjectiveId}
            selectedTaskId={selectedTaskId}
          />
        </div>
        <div className="pointer-events-auto">
          <GalaxyRail
            galaxies={universe.galaxies}
            selectedGalaxyId={selectedGalaxyId}
            onSelect={selectGalaxy}
          />
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-12 left-1/2 hidden -translate-x-1/2 rounded-full border border-white/10 bg-slate-950/48 px-16 py-8 text-xs text-slate-300 backdrop-blur-xl lg:flex lg:items-center lg:gap-8">
        <Sparkles className="size-16 text-violet-300" aria-hidden="true" />
        Smooth camera transitions preserve context while the universe keeps moving.
      </div>
    </div>
  );
}

function HudStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-16">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-8 text-xl font-medium text-white">{value}</p>
    </div>
  );
}
