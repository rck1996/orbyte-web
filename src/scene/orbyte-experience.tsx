"use client";

import { useEffect } from "react";

import { UniverseHud } from "@/components/overlays/universe-hud";
import { UniverseCanvas } from "@/scene/universe-canvas";
import { useUniverseStore } from "@/store/universe-store";
import type { UniverseData } from "@/types/universe";

export function OrbyteExperience({ universe }: { universe: UniverseData }) {
  const bootstrap = useUniverseStore((state) => state.bootstrap);

  useEffect(() => {
    bootstrap(universe.galaxies[1]?.id ?? universe.galaxies[0]?.id ?? null);
  }, [bootstrap, universe.galaxies]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(125,211,252,0.18),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(167,139,250,0.16),transparent_24%),radial-gradient(circle_at_20%_80%,rgba(52,211,153,0.12),transparent_24%)]" />
      <UniverseCanvas universe={universe} />
      <UniverseHud universe={universe} />
    </div>
  );
}
