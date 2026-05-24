"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { setSceneAnchor } from "@/lib/scene-anchors";
import { stateVisuals } from "@/lib/space";
import { useUniverseStore } from "@/store/universe-store";
import type { TaskNode } from "@/types/universe";

export function TaskPlanet({
  task,
  baseAngle,
  radius,
  showSubtasks,
}: {
  task: TaskNode;
  baseAngle: number;
  radius: number;
  showSubtasks: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const subtaskOrbit = useRef<THREE.Group>(null);
  const visual = stateVisuals(task.state);
  const selectedTaskId = useUniverseStore((state) => state.selectedTaskId);
  const selectedSubtaskId = useUniverseStore((state) => state.selectedSubtaskId);
  const selectedObjectiveId = useUniverseStore((state) => state.selectedObjectiveId);
  const selectTask = useUniverseStore((state) => state.selectTask);
  const selectSubtask = useUniverseStore((state) => state.selectSubtask);
  const hoveredSubtaskId = useUniverseStore((state) => state.hoveredSubtaskId);
  const setHoveredSubtask = useUniverseStore((state) => state.setHoveredSubtask);
  const suppressClickUntil = useUniverseStore((state) => state.suppressClickUntil);

  const subtasks = useMemo(() => task.subtasks, [task.subtasks]);

  useFrame(({ clock }) => {
    if (!group.current) {
      return;
    }

    const t = clock.getElapsedTime();
    const speed = selectedTaskId === task.id ? 0.018 : 0.045;
    const angle = baseAngle + t * speed;
    group.current.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle * 0.9) * 0.1,
      Math.sin(angle) * radius,
    );
    group.current.rotation.y += selectedTaskId === task.id ? 0.0015 : 0.003;

    const position = group.current.getWorldPosition(new THREE.Vector3());
    setSceneAnchor(task.id, [position.x, position.y, position.z]);

    if (ring.current) {
      ring.current.rotation.z += task.state === "in_progress" ? 0.012 : 0.004;
      ring.current.visible = task.state !== "todo";
    }

    if (subtaskOrbit.current && showSubtasks) {
      const orbitSpeed = selectedTaskId === task.id ? 0.0018 : 0.0032;
      subtaskOrbit.current.rotation.y += orbitSpeed;
    }
  });

  const active = selectedTaskId === task.id;
  const showTaskLabel = selectedObjectiveId !== null && !active && !showSubtasks;

  return (
    <group ref={group}>
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          if (Date.now() < suppressClickUntil) {
            return;
          }
          selectTask(task.id);
        }}
        scale={active ? 1.2 : 1}
      >
        <sphereGeometry args={[visual.scale, 16, 16]} />
        <meshStandardMaterial
          color={visual.color}
          emissive={visual.emissive}
          emissiveIntensity={task.state === "blocked" ? 1.8 : active ? 1.5 : 0.85}
          roughness={0.45}
          metalness={0.15}
        />
      </mesh>

      <mesh
        onClick={(event) => {
          event.stopPropagation();
          if (Date.now() < suppressClickUntil) {
            return;
          }
          selectTask(task.id);
        }}
      >
        <sphereGeometry args={[visual.scale + 0.3, 12, 12]} />
        <meshBasicMaterial transparent opacity={0.01} depthWrite={false} />
      </mesh>

      <mesh ref={ring} rotation-x={Math.PI / 2}>
        <torusGeometry args={[visual.scale + 0.42, 0.03, 8, 32]} />
        <meshBasicMaterial
          color={task.state === "blocked" ? "#fb7185" : "#93c5fd"}
          transparent
          opacity={task.state === "done" ? 0.22 : 0.48}
        />
      </mesh>

      {showTaskLabel ? (
        <Html
          position={[0, visual.scale + 0.55, 0]}
          center
          occlude
          distanceFactor={10}
          transform
          sprite
        >
          <div className="pointer-events-none rounded-full border border-white/10 bg-slate-950/76 px-12 py-4 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-100 backdrop-blur-xl">
            {task.name}
          </div>
        </Html>
      ) : null}

      {showSubtasks ? <group ref={subtaskOrbit}>{subtasks.map((subtask, index) => {
            const satAngle = (index / Math.max(subtasks.length, 1)) * Math.PI * 2;
            const satRadius = visual.scale + 1 + index * 0.24;
            const x = Math.cos(satAngle) * satRadius;
            const z = Math.sin(satAngle) * satRadius;
            const y = Math.sin(satAngle * 1.5) * 0.08;
            const hovered = hoveredSubtaskId === subtask.id;
            const selected = selectedSubtaskId === subtask.id;

            return (
              <group key={subtask.id}>
                <mesh rotation-x={Math.PI / 2} raycast={() => null}>
                  <ringGeometry args={[satRadius - 0.012, satRadius + 0.012, 48]} />
                  <meshBasicMaterial
                    color={selected ? "#7dd3fc" : "#334155"}
                    transparent
                    opacity={selected ? 0.32 : 0.16}
                  />
                </mesh>
                <group position={[x, y, z]}>
                  <mesh rotation-x={Math.PI / 2} raycast={() => null}>
                    <ringGeometry args={[0.2, 0.24, 24]} />
                    <meshBasicMaterial
                      color={selected ? "#7dd3fc" : "#64748b"}
                      transparent
                      opacity={selected ? 0.9 : 0.55}
                    />
                  </mesh>
                  <mesh
                    onClick={(event) => {
                      event.stopPropagation();
                      if (Date.now() < suppressClickUntil) {
                        return;
                      }
                      selectSubtask(subtask.id);
                    }}
                    onPointerEnter={(event) => {
                      event.stopPropagation();
                      setHoveredSubtask(subtask.id);
                    }}
                    onPointerLeave={(event) => {
                      event.stopPropagation();
                      setHoveredSubtask(null);
                    }}
                  >
                    <sphereGeometry args={[0.34, 12, 12]} />
                    <meshBasicMaterial transparent opacity={0.01} depthWrite={false} />
                  </mesh>
                  <mesh
                    onClick={(event) => {
                      event.stopPropagation();
                      if (Date.now() < suppressClickUntil) {
                        return;
                      }
                      selectSubtask(subtask.id);
                    }}
                    onPointerEnter={(event) => {
                      event.stopPropagation();
                      setHoveredSubtask(subtask.id);
                    }}
                    onPointerLeave={(event) => {
                      event.stopPropagation();
                      setHoveredSubtask(null);
                    }}
                    rotation={[Math.PI / 4, 0, Math.PI / 4]}
                  >
                    <octahedronGeometry args={[0.14, 0]} />
                    <meshStandardMaterial
                      color={hovered || selected ? "#f8fafc" : "#cbd5e1"}
                      emissive={selected ? "#38bdf8" : hovered ? "#94a3b8" : "#000000"}
                      emissiveIntensity={selected ? 1.2 : hovered ? 0.45 : 0}
                      roughness={0.28}
                      metalness={0.52}
                    />
                  </mesh>
                  <Html
                    position={[0, 0.28, 0]}
                    center
                    occlude
                    distanceFactor={13}
                    transform
                    sprite
                  >
                    <div className="pointer-events-none rounded-full border border-white/10 bg-slate-950/76 px-8 py-4 text-[9px] font-medium uppercase tracking-[0.1em] text-slate-100 backdrop-blur-xl">
                      {subtask.name}
                    </div>
                  </Html>
                  {hovered || selected ? (
                    <Html distanceFactor={11} occlude>
                      <div className="pointer-events-none min-w-[180px] rounded-[16px] border border-white/12 bg-slate-950/85 px-12 py-8 text-xs text-slate-100 shadow-[0_18px_60px_rgba(2,6,23,0.45)] backdrop-blur-xl">
                        <p className="font-medium">Subtask | {subtask.name}</p>
                        <p className="mt-4 leading-[1.5] text-slate-300">{subtask.metadata}</p>
                        <p className="mt-4 text-slate-400">
                          {subtask.progress}% | {subtask.dueDate}
                        </p>
                      </div>
                    </Html>
                  ) : null}
                </group>
              </group>
            );
          })}</group> : null}

      {active ? (
        <Html
          position={[0, visual.scale + 0.8, 0]}
          distanceFactor={14}
          occlude
          transform
          sprite
        >
          <div className="pointer-events-none rounded-full border border-sky-300/20 bg-slate-950/80 px-12 py-8 text-xs text-slate-100 backdrop-blur-lg">
            {task.name}
          </div>
        </Html>
      ) : null}
    </group>
  );
}
