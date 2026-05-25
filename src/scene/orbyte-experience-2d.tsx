"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { UniverseHud } from "@/components/overlays/universe-hud";
import { UniverseMap2D } from "@/components/universe-2d/universe-map-2d";
import { useUniverseStore } from "@/store/universe-store";
import type { WorkspaceDomain } from "@/types/domain";
import type { UniverseData } from "@/types/universe";

export function OrbyteExperience2D({
  universe,
  workspace,
}: {
  universe: UniverseData;
  workspace: WorkspaceDomain;
}) {
  const bootstrap = useUniverseStore((state) => state.bootstrap);
  const selectedGalaxyId = useUniverseStore((state) => state.selectedGalaxyId);
  const selectedObjectiveId = useUniverseStore((state) => state.selectedObjectiveId);
  const selectedTaskId = useUniverseStore((state) => state.selectedTaskId);
  const selectedSubtaskId = useUniverseStore((state) => state.selectedSubtaskId);
  const [liveUniverse, setLiveUniverse] = useState(universe);
  const [liveWorkspace, setLiveWorkspace] = useState(workspace);
  const [transitionPulse, setTransitionPulse] = useState(0);
  const [performanceMode, setPerformanceMode] = useState(false);

  useEffect(() => {
    bootstrap(null);
  }, [bootstrap, liveUniverse.galaxies]);

  useEffect(() => {
    const media = window.matchMedia("(pointer: coarse), (max-width: 767px)");
    const update = () => setPerformanceMode(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const key = [selectedGalaxyId, selectedObjectiveId, selectedTaskId, selectedSubtaskId]
      .filter(Boolean)
      .join(":");

    if (!key || performanceMode) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      setTransitionPulse((value) => value + 1);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [performanceMode, selectedGalaxyId, selectedObjectiveId, selectedTaskId, selectedSubtaskId]);

  async function refreshData() {
    const [universeResponse, workspaceResponse] = await Promise.all([
      fetch("/api/universe"),
      fetch("/api/workspace"),
    ]);
    const nextUniverse = (await universeResponse.json()) as UniverseData;
    const nextWorkspace = (await workspaceResponse.json()) as WorkspaceDomain;
    setLiveUniverse(nextUniverse);
    setLiveWorkspace(nextWorkspace);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(125,211,252,0.18),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(167,139,250,0.16),transparent_24%),radial-gradient(circle_at_20%_80%,rgba(52,211,153,0.12),transparent_24%)]" />
      <UniverseMap2D
        universe={liveUniverse}
        workspace={liveWorkspace}
        transitionPulse={transitionPulse}
        onRefreshData={refreshData}
        performanceMode={performanceMode}
      />
      <AnimatePresence>
        {transitionPulse > 0 && !performanceMode ? (
          <>
            <motion.div
              key={`fade-${transitionPulse}`}
              className="pointer-events-none absolute inset-0 z-10 bg-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.34, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.div
              key={`spotlight-${transitionPulse}`}
              className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),rgba(2,6,23,0.7)_40%,rgba(0,0,0,0.88)_72%)]"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: [0, 0.38, 0], scale: [0.94, 1.04, 1.08] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.68, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.div
              key={`veil-${transitionPulse}`}
              className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(135deg,rgba(14,165,233,0.08),transparent_30%,transparent_70%,rgba(251,191,36,0.08))]"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.22, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
            />
          </>
        ) : null}
      </AnimatePresence>
      <UniverseHud
        universe={liveUniverse}
        workspace={liveWorkspace}
        onRefreshData={refreshData}
        presentation="2d"
      />
    </div>
  );
}
