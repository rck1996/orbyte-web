"use client";

import { Html, Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { TaskPlanet } from "@/components/planets/task-planet";
import { setSceneAnchor } from "@/lib/scene-anchors";
import { useUniverseStore } from "@/store/universe-store";
import type { ObjectiveNode } from "@/types/universe";

export function ObjectiveSystem({
  objective,
  index,
  galaxyColor,
}: {
  objective: ObjectiveNode;
  index: number;
  galaxyColor: string;
}) {
  const group = useRef<THREE.Group>(null);
  const selectedObjectiveId = useUniverseStore((state) => state.selectedObjectiveId);
  const selectObjective = useUniverseStore((state) => state.selectObjective);

  const orbitPoints = useMemo(() => {
    const points: [number, number, number][] = [];

    for (let step = 0; step <= 36; step += 1) {
      const angle = (step / 36) * Math.PI * 2;
      points.push([
        Math.cos(angle) * objective.orbitRadius,
        0,
        Math.sin(angle) * objective.orbitRadius,
      ]);
    }

    return points;
  }, [objective.orbitRadius]);

  useFrame(({ clock }) => {
    if (!group.current) {
      return;
    }

    const t = clock.getElapsedTime();
    const drift = index * 0.9;
    group.current.rotation.y = t * 0.12 + drift;
    group.current.position.y = Math.sin(t * 0.45 + drift) * 0.25;

    const position = group.current.getWorldPosition(new THREE.Vector3());
    setSceneAnchor(objective.id, [position.x, position.y, position.z]);
  });

  const active = selectedObjectiveId === objective.id;

  return (
    <group ref={group}>
      <Line points={orbitPoints} color={galaxyColor} transparent opacity={0.18} lineWidth={1} />

      <group position={[objective.orbitRadius, 0, 0]}>
        <mesh
          onClick={(event) => {
            event.stopPropagation();
            selectObjective(objective.id);
          }}
          scale={active ? 1.18 : 1}
        >
          <sphereGeometry args={[0.42, 16, 16]} />
          <meshStandardMaterial
            color={galaxyColor}
            emissive={galaxyColor}
            emissiveIntensity={active ? 1.4 : 0.7}
            roughness={0.28}
            metalness={0.2}
          />
        </mesh>

        {active ? (
          <Html distanceFactor={18}>
            <div className="rounded-full border border-white/12 bg-slate-950/80 px-12 py-8 text-xs text-white backdrop-blur-xl">
              {objective.name}
            </div>
          </Html>
        ) : null}

        {objective.tasks.map((task, taskIndex) => (
          <TaskPlanet
            key={task.id}
            task={task}
            baseAngle={(taskIndex / Math.max(objective.tasks.length, 1)) * Math.PI * 2}
            radius={1.8 + taskIndex * 1.4}
          />
        ))}
      </group>
    </group>
  );
}
