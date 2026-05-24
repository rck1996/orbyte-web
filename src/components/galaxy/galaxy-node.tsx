"use client";

import { Html, Line, Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { ObjectiveSystem } from "@/components/solar-system/objective-system";
import { setSceneAnchor } from "@/lib/scene-anchors";
import { useUniverseStore } from "@/store/universe-store";
import type { GalaxyNode as GalaxyNodeType } from "@/types/universe";

export function GalaxyNode({
  galaxy,
  mapPosition,
}: {
  galaxy: GalaxyNodeType;
  mapPosition: [number, number, number];
}) {
  const group = useRef<THREE.Group>(null);
  const spiral = useRef<THREE.Group>(null);
  const hoveredGalaxyId = useUniverseStore((state) => state.hoveredGalaxyId);
  const selectedGalaxyId = useUniverseStore((state) => state.selectedGalaxyId);
  const selectedObjectiveId = useUniverseStore((state) => state.selectedObjectiveId);
  const selectedTaskId = useUniverseStore((state) => state.selectedTaskId);
  const setHoveredGalaxy = useUniverseStore((state) => state.setHoveredGalaxy);
  const selectGalaxy = useUniverseStore((state) => state.selectGalaxy);
  const suppressClickUntil = useUniverseStore((state) => state.suppressClickUntil);
  const hasGalaxyFocus = selectedGalaxyId !== null;

  const active = selectedGalaxyId === galaxy.id;
  const hovered = hoveredGalaxyId === galaxy.id;

  const sparkleScale = useMemo(
    () => [8, 10, 12].map((value) => value * (active ? 1.2 : 1)) as [number, number, number],
    [active],
  );
  const spiralPoints = useMemo(() => {
    const points: [number, number, number][] = [];

    for (let step = 0; step <= 90; step += 1) {
      const progress = step / 90;
      const angle = progress * Math.PI * 4.2;
      const radius = 0.45 + progress * 1.65;
      points.push([
        Math.cos(angle) * radius,
        Math.sin(progress * Math.PI) * 0.08,
        Math.sin(angle) * radius,
      ]);
    }

    return points;
  }, []);
  const systemSpread = useMemo(() => {
    const maxSystemRadius = galaxy.objectives.reduce((largest, objective) => {
      const farthestTaskOrbit =
        objective.tasks.length > 0 ? 2.9 + (objective.tasks.length - 1) * 1.55 : 2.9;
      const footprint = Math.max(objective.orbitRadius + 0.2, farthestTaskOrbit) + 3.4;
      return Math.max(largest, footprint);
    }, 7.5);

    const total = Math.max(galaxy.objectives.length, 1);

    if (total <= 1) {
      return 0;
    }

    const adjacentSpacing = maxSystemRadius * 2.45;
    const ringRadius = adjacentSpacing / (2 * Math.sin(Math.PI / total));
    return Math.max(ringRadius, maxSystemRadius + 4.5);
  }, [galaxy.objectives]);

  useFrame(({ clock }) => {
    if (!group.current) {
      return;
    }

    const t = clock.getElapsedTime();
    group.current.rotation.y += 0.0012;
    group.current.rotation.z = Math.sin(t * 0.08 + galaxy.position[0]) * 0.04;
    const focusScale = hasGalaxyFocus && !active ? 1.45 : 1;
    const targetX = active ? 0 : mapPosition[0] * focusScale;
    const targetZ = active ? 0 : mapPosition[2] * focusScale;
    const targetY =
      (active ? 0 : mapPosition[1]) + Math.sin(t * 0.12 + galaxy.position[2]) * 0.28;

    group.current.position.x = THREE.MathUtils.damp(group.current.position.x, targetX, 3.2, 0.1);
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, targetY, 3.2, 0.1);
    group.current.position.z = THREE.MathUtils.damp(group.current.position.z, targetZ, 3.2, 0.1);

    const scale = active ? 1.2 : hovered ? 1.08 : 1;
    group.current.scale.setScalar(
      THREE.MathUtils.damp(group.current.scale.x, scale, 4, 0.1),
    );

    if (spiral.current) {
      spiral.current.rotation.y += active ? 0.0012 : 0.0026;
      spiral.current.rotation.z = Math.sin(t * 0.12 + galaxy.position[0]) * 0.08;
    }

    const position = group.current.getWorldPosition(new THREE.Vector3());
    setSceneAnchor(galaxy.id, [position.x, position.y, position.z]);
  });

  return (
    <group
      ref={group}
      onPointerEnter={(event) => {
        event.stopPropagation();
        setHoveredGalaxy(galaxy.id);
      }}
      onPointerLeave={(event) => {
        event.stopPropagation();
        setHoveredGalaxy(null);
      }}
    >
      <group
        ref={spiral}
        onClick={(event) => {
          event.stopPropagation();
          if (Date.now() < suppressClickUntil) {
            return;
          }
          selectGalaxy(galaxy.id);
        }}
      >
        <Line
          points={spiralPoints}
          color={galaxy.accent}
          transparent
          opacity={active ? 0.9 : hasGalaxyFocus ? 0.2 : hovered ? 0.72 : 0.5}
          lineWidth={1}
        />
        <mesh rotation-x={Math.PI / 2}>
          <ringGeometry args={[0.9, 1.08, 48]} />
          <meshBasicMaterial
            color={galaxy.color}
            transparent
            opacity={active ? 0.34 : hasGalaxyFocus ? 0.08 : 0.18}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.34, 16, 16]} />
          <meshStandardMaterial
            color={galaxy.color}
            emissive={galaxy.accent}
            emissiveIntensity={active ? 1.8 : hasGalaxyFocus ? 0.35 : hovered ? 1.2 : 0.9}
            roughness={0.2}
            metalness={0.18}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[1.95, 14, 14]} />
          <meshBasicMaterial transparent opacity={0.01} depthWrite={false} />
        </mesh>
      </group>

      {!active ? (
        <Html
          position={[0, 1.7, 0]}
          center
          occlude
          distanceFactor={14}
          transform
          sprite
        >
          <div className="pointer-events-none rounded-full border border-white/10 bg-slate-950/72 px-12 py-4 text-[10px] font-medium uppercase tracking-[0.16em] text-white backdrop-blur-xl">
            {galaxy.name}
          </div>
        </Html>
      ) : null}

      <Sparkles
        count={8}
        scale={sparkleScale}
        size={active ? 1.8 : 1.2}
        speed={0.08}
        color={galaxy.accent}
      />

      {active
        ? galaxy.objectives
            .filter(
              (objective) =>
                !selectedTaskId || !selectedObjectiveId || selectedObjectiveId === objective.id,
            )
            .map((objective, index) => (
            <ObjectiveSystem
              key={objective.id}
              objective={objective}
              index={index}
              total={galaxy.objectives.length}
              systemSpread={systemSpread}
              galaxyAccent={galaxy.accent}
              showTasks={!selectedObjectiveId || selectedObjectiveId === objective.id}
            />
          ))
        : null}
    </group>
  );
}
