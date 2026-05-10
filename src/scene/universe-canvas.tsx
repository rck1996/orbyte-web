"use client";

import { Canvas } from "@react-three/fiber";

import { UniverseScene } from "@/scene/universe-scene";
import type { UniverseData } from "@/types/universe";

export function UniverseCanvas({ universe }: { universe: UniverseData }) {
  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 1.2]}
        camera={{ position: [18, 10, 34], fov: 42 }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
        }}
      >
        <UniverseScene universe={universe} />
      </Canvas>
    </div>
  );
}
