"use client";

import { Html, Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { ObjectiveSystem } from "@/components/solar-system/objective-system";
import { setSceneAnchor } from "@/lib/scene-anchors";
import { useUniverseStore } from "@/store/universe-store";
import type { GalaxyNode as GalaxyNodeType } from "@/types/universe";

export function GalaxyNode({ galaxy }: { galaxy: GalaxyNodeType }) {
  const group = useRef<THREE.Group>(null);
  const halo = useRef<THREE.Mesh>(null);
  const hoveredGalaxyId = useUniverseStore((state) => state.hoveredGalaxyId);
  const selectedGalaxyId = useUniverseStore((state) => state.selectedGalaxyId);
  const setHoveredGalaxy = useUniverseStore((state) => state.setHoveredGalaxy);
  const selectGalaxy = useUniverseStore((state) => state.selectGalaxy);

  const active = selectedGalaxyId === galaxy.id;
  const hovered = hoveredGalaxyId === galaxy.id;

  const sparkleScale = useMemo(
    () => [8, 10, 12].map((value) => value * (active ? 1.2 : 1)) as [number, number, number],
    [active],
  );

  useFrame(({ clock }) => {
    if (!group.current) {
      return;
    }

    const t = clock.getElapsedTime();
    group.current.rotation.y += 0.0025;
    group.current.rotation.z = Math.sin(t * 0.12 + galaxy.position[0]) * 0.06;
    group.current.position.y =
      galaxy.position[1] + Math.sin(t * 0.2 + galaxy.position[2]) * 0.45;

    const scale = active ? 1.2 : hovered ? 1.08 : 1;
    group.current.scale.setScalar(
      THREE.MathUtils.damp(group.current.scale.x, scale, 4, 0.1),
    );

    if (halo.current) {
      halo.current.rotation.z += 0.003;
      const targetOpacity = active ? 0.34 : hovered ? 0.24 : 0.16;
      (halo.current.material as THREE.MeshBasicMaterial).opacity =
        THREE.MathUtils.damp(
          (halo.current.material as THREE.MeshBasicMaterial).opacity,
          targetOpacity,
          5,
          0.1,
        );
    }

    const position = group.current.getWorldPosition(new THREE.Vector3());
    setSceneAnchor(galaxy.id, [position.x, position.y, position.z]);
  });

  return (
    <group
      ref={group}
      position={galaxy.position}
      onPointerEnter={(event) => {
        event.stopPropagation();
        setHoveredGalaxy(galaxy.id);
      }}
      onPointerLeave={(event) => {
        event.stopPropagation();
        setHoveredGalaxy(null);
      }}
    >
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          selectGalaxy(galaxy.id);
        }}
      >
        <sphereGeometry args={[1.45, 20, 20]} />
        <meshStandardMaterial
          color={galaxy.color}
          emissive={galaxy.color}
          emissiveIntensity={active ? 2 : hovered ? 1.4 : 0.9}
          roughness={0.18}
          metalness={0.24}
        />
      </mesh>

      <mesh ref={halo} rotation-x={Math.PI / 2}>
        <torusGeometry args={[2.6, 0.08, 12, 48]} />
        <meshBasicMaterial color={galaxy.accent} transparent opacity={0.16} />
      </mesh>

      <Sparkles
        count={10}
        scale={sparkleScale}
        size={active ? 2.2 : 1.6}
        speed={0.12}
        color={galaxy.accent}
      />

      {hovered || active ? (
        <Html distanceFactor={16}>
          <div className="min-w-[220px] rounded-[18px] border border-white/12 bg-slate-950/82 px-16 py-12 text-white shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-2xl">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              {galaxy.category}
            </p>
            <p className="mt-8 text-sm font-medium">{galaxy.name}</p>
            <p className="mt-8 text-xs leading-[1.5] text-slate-300">
              {galaxy.description}
            </p>
          </div>
        </Html>
      ) : null}

      {active
        ? galaxy.objectives.map((objective, index) => (
            <ObjectiveSystem
              key={objective.id}
              objective={objective}
              index={index}
              galaxyColor={galaxy.color}
            />
          ))
        : null}
    </group>
  );
}
