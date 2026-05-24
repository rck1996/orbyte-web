"use client";

import { useEffect, useState } from "react";

import { UniverseHud } from "@/components/overlays/universe-hud";
import { UniverseCanvas } from "@/scene/universe-canvas";
import { useUniverseStore } from "@/store/universe-store";
import type { WorkspaceDomain } from "@/types/domain";
import type { UniverseData } from "@/types/universe";

export function OrbyteExperience({
  universe,
  workspace,
}: {
  universe: UniverseData;
  workspace: WorkspaceDomain;
}) {
  const bootstrap = useUniverseStore((state) => state.bootstrap);
  const [liveUniverse, setLiveUniverse] = useState(universe);
  const [liveWorkspace, setLiveWorkspace] = useState(workspace);

  useEffect(() => {
    bootstrap(null);
  }, [bootstrap, liveUniverse.galaxies]);

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
      <UniverseCanvas universe={liveUniverse} />
      <UniverseHud
        universe={liveUniverse}
        workspace={liveWorkspace}
        onRefreshData={refreshData}
      />
    </div>
  );
}
