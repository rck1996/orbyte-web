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
  total,
  systemSpread,
  galaxyAccent,
  showTasks,
}: {
  objective: ObjectiveNode;
  index: number;
  total: number;
  systemSpread: number;
  galaxyAccent: string;
  showTasks: boolean;
}) {
  const habits = objective.habits ?? [];
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const coreShell = useRef<THREE.Mesh>(null);
  const selectedObjectiveId = useUniverseStore((state) => state.selectedObjectiveId);
  const selectedTaskId = useUniverseStore((state) => state.selectedTaskId);
  const selectObjective = useUniverseStore((state) => state.selectObjective);
  const suppressClickUntil = useUniverseStore((state) => state.suppressClickUntil);

  const orbitPoints = useMemo(() => {
    const points: [number, number, number][] = [];

    for (let step = 0; step <= 64; step += 1) {
      const angle = (step / 64) * Math.PI * 2;
      points.push([
        Math.cos(angle) * (objective.orbitRadius + 0.2),
        0,
        Math.sin(angle) * (objective.orbitRadius + 0.2),
      ]);
    }

    return points;
  }, [objective.orbitRadius]);
  const habitBeltRadius = useMemo(
    () => Math.max(1.7, Math.min(objective.orbitRadius - 1.4, 2.2)),
    [objective.orbitRadius],
  );
  const habitBeltPoints = useMemo(() => {
    const points: [number, number, number][] = [];

    for (let step = 0; step <= 72; step += 1) {
      const angle = (step / 72) * Math.PI * 2;
      points.push([
        Math.cos(angle) * habitBeltRadius,
        0,
        Math.sin(angle) * habitBeltRadius,
      ]);
    }

    return points;
  }, [habitBeltRadius]);

  const basePosition = useMemo(() => {
    if (total <= 1) {
      return new THREE.Vector3(0, 0, 0);
    }

    const radius = systemSpread;
    const angle = (index / total) * Math.PI * 2;
    return new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
  }, [index, systemSpread, total]);

  useFrame(({ clock }) => {
    if (!group.current) {
      return;
    }

    const t = clock.getElapsedTime();
    const active = selectedObjectiveId === objective.id;
    const offset = active ? new THREE.Vector3(0, 0, 0) : basePosition;
    group.current.position.x = THREE.MathUtils.damp(group.current.position.x, offset.x, 3.4, 0.1);
    group.current.position.y = THREE.MathUtils.damp(
      group.current.position.y,
      Math.sin(t * 0.18 + index * 0.9) * 0.14,
      3.4,
      0.1,
    );
    group.current.position.z = THREE.MathUtils.damp(group.current.position.z, offset.z, 3.4, 0.1);
    group.current.rotation.y += active ? 0.0016 : 0.0008;

    if (core.current) {
      core.current.rotation.y += 0.002;
      core.current.rotation.x += 0.0014;
    }

    if (coreShell.current) {
      const pulse = 1 + Math.sin(t * 1.2 + index * 0.6) * 0.05;
      coreShell.current.scale.setScalar(active ? pulse * 1.08 : pulse);
    }

    const position = group.current.getWorldPosition(new THREE.Vector3());
    setSceneAnchor(objective.id, [position.x, position.y, position.z]);
  });

  const active = selectedObjectiveId === objective.id;
  const isolateTaskFocus = selectedTaskId !== null;
  const dimmed = selectedObjectiveId !== null && !active;
  const showObjectiveLabel = !selectedTaskId && !active;

  return (
    <group ref={group}>
      {!isolateTaskFocus ? (
        <Line
          points={orbitPoints}
          color={galaxyAccent}
          transparent
          opacity={active ? 0.34 : dimmed ? 0.07 : 0.18}
          lineWidth={1}
        />
      ) : null}

      {habits.length > 0 ? (
        <Line
          points={habitBeltPoints}
          color="#22d3ee"
          transparent
          opacity={active ? 0.22 : 0.1}
          lineWidth={1}
        />
      ) : null}

      <mesh rotation-x={Math.PI / 2} raycast={() => null}>
        <ringGeometry args={[1.2, 1.46, 64]} />
        <meshBasicMaterial color="#fcd34d" transparent opacity={active ? 0.34 : 0.16} />
      </mesh>

      <mesh ref={coreShell}>
        <sphereGeometry args={[1.12, 24, 24]} />
        <meshBasicMaterial color="#fde68a" transparent opacity={active ? 0.14 : 0.08} />
      </mesh>

      <mesh
        ref={core}
        onClick={(event) => {
          event.stopPropagation();
          if (Date.now() < suppressClickUntil) {
            return;
          }
          selectObjective(objective.id);
        }}
        scale={active ? 1.16 : 1}
      >
        <sphereGeometry args={[0.92, 28, 28]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#fff7d6"
          emissiveIntensity={active ? 3.2 : dimmed ? 0.45 : 2}
          roughness={0.24}
          metalness={0.04}
        />
      </mesh>

      <mesh
        onClick={(event) => {
          event.stopPropagation();
          if (Date.now() < suppressClickUntil) {
            return;
          }
          selectObjective(objective.id);
        }}
      >
        <sphereGeometry args={[1.4, 18, 18]} />
        <meshBasicMaterial transparent opacity={0.01} depthWrite={false} />
      </mesh>

      <pointLight
        position={[0, 0, 0]}
        intensity={active ? 24 : 12}
        distance={active ? 14 : 10}
        color="#fde68a"
      />

      {showObjectiveLabel ? (
        <Html
          position={[0, 1.7, 0]}
          center
          occlude
          distanceFactor={12}
          transform
          sprite
        >
          <div className="pointer-events-none rounded-full border border-white/10 bg-slate-950/72 px-12 py-4 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-100 backdrop-blur-xl">
            {objective.name}
          </div>
        </Html>
      ) : null}

      {active ? (
        <Html position={[0, 1.95, 0]} distanceFactor={16} occlude transform sprite>
          <div className="pointer-events-none rounded-full border border-white/12 bg-slate-950/80 px-12 py-8 text-xs text-white backdrop-blur-xl">
            {objective.name}
          </div>
        </Html>
      ) : null}

      {!isolateTaskFocus
        ? habits.map((habit, habitIndex) => {
            const angle = (habitIndex / Math.max(habits.length, 1)) * Math.PI * 2;
            const x = Math.cos(angle) * habitBeltRadius;
            const z = Math.sin(angle) * habitBeltRadius;
            const y = 0;
            const scale =
              habit.cadence === "daily" ? 0.12 : habit.cadence === "weekly" ? 0.14 : 0.17;
            const progressOpacity = 0.28 + habit.progress / 220;

            return (
              <group key={habit.id} position={[x, y, z]}>
                <mesh rotation-x={Math.PI / 2} raycast={() => null}>
                  <ringGeometry args={[scale + 0.03, scale + 0.055, 18]} />
                  <meshBasicMaterial
                    color="#22d3ee"
                    transparent
                    opacity={active ? progressOpacity : progressOpacity * 0.7}
                  />
                </mesh>
                <mesh rotation={[0, 0, Math.PI / 4]}>
                  <octahedronGeometry args={[scale, 0]} />
                  <meshStandardMaterial
                    color="#cffafe"
                    emissive="#22d3ee"
                    emissiveIntensity={active ? 0.95 : 0.55}
                    roughness={0.18}
                    metalness={0.38}
                  />
                </mesh>
                <Html
                  position={[0, scale + 0.12, 0]}
                  center
                  occlude
                  distanceFactor={15}
                  transform
                  sprite
                >
                  <div className="pointer-events-none rounded-full border border-cyan-300/14 bg-slate-950/72 px-8 py-4 text-[8px] font-medium uppercase tracking-[0.14em] text-cyan-100 backdrop-blur-xl">
                    {habit.cadence}
                  </div>
                </Html>
              </group>
            );
          })
        : null}

      {showTasks
        ? objective.tasks
            .filter((task) => !selectedTaskId || selectedTaskId === task.id)
            .map((task, taskIndex) => (
              <TaskPlanet
                key={task.id}
                task={task}
                baseAngle={(taskIndex / Math.max(objective.tasks.length, 1)) * Math.PI * 2}
                radius={2.9 + taskIndex * 1.55}
                showSubtasks={selectedTaskId === task.id}
              />
            ))
        : null}
    </group>
  );
}
