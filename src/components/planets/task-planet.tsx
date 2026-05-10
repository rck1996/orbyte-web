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
}: {
  task: TaskNode;
  baseAngle: number;
  radius: number;
}) {
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const visual = stateVisuals(task.state);
  const selectedTaskId = useUniverseStore((state) => state.selectedTaskId);
  const selectTask = useUniverseStore((state) => state.selectTask);
  const hoveredSubtaskId = useUniverseStore((state) => state.hoveredSubtaskId);
  const setHoveredSubtask = useUniverseStore((state) => state.setHoveredSubtask);

  const subtasks = useMemo(() => task.subtasks, [task.subtasks]);

  useFrame(({ clock }) => {
    if (!group.current) {
      return;
    }

    const t = clock.getElapsedTime();
    const angle = baseAngle + t * 0.22;
    group.current.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle * 1.4) * 0.4,
      Math.sin(angle) * radius,
    );
    group.current.rotation.y += 0.01;

    const position = group.current.getWorldPosition(new THREE.Vector3());
    setSceneAnchor(task.id, [position.x, position.y, position.z]);

    if (ring.current) {
      ring.current.rotation.z += task.state === "in_progress" ? 0.03 : 0.01;
      ring.current.visible = task.state !== "todo";
    }
  });

  const active = selectedTaskId === task.id;

  return (
    <group ref={group}>
      <mesh
        onClick={(event) => {
          event.stopPropagation();
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

      <mesh ref={ring} rotation-x={Math.PI / 2}>
        <torusGeometry args={[visual.scale + 0.42, 0.03, 8, 32]} />
        <meshBasicMaterial
          color={task.state === "blocked" ? "#fb7185" : "#93c5fd"}
          transparent
          opacity={task.state === "done" ? 0.22 : 0.48}
        />
      </mesh>

      {subtasks.map((subtask, index) => {
        const satAngle = (index / Math.max(subtasks.length, 1)) * Math.PI * 2;
        const satRadius = visual.scale + 0.9 + index * 0.18;
        const x = Math.cos(satAngle) * satRadius;
        const z = Math.sin(satAngle) * satRadius;
        const hovered = hoveredSubtaskId === subtask.id;

        return (
          <group key={subtask.id} position={[x, 0, z]}>
            <mesh
              onPointerEnter={(event) => {
                event.stopPropagation();
                setHoveredSubtask(subtask.id);
              }}
              onPointerLeave={(event) => {
                event.stopPropagation();
                setHoveredSubtask(null);
              }}
            >
              <sphereGeometry args={[0.12, 12, 12]} />
              <meshBasicMaterial color={hovered ? "#ffffff" : "#cbd5e1"} />
            </mesh>
            {hovered ? (
              <Html distanceFactor={11}>
                <div className="min-w-[180px] rounded-[16px] border border-white/12 bg-slate-950/85 px-12 py-8 text-xs text-slate-100 shadow-[0_18px_60px_rgba(2,6,23,0.45)] backdrop-blur-xl">
                  <p className="font-medium">{subtask.name}</p>
                  <p className="mt-4 leading-[1.5] text-slate-300">{subtask.metadata}</p>
                  <p className="mt-4 text-slate-400">{subtask.progress}% | {subtask.dueDate}</p>
                </div>
              </Html>
            ) : null}
          </group>
        );
      })}

      {active ? (
        <Html distanceFactor={14}>
          <div className="rounded-full border border-sky-300/20 bg-slate-950/80 px-12 py-8 text-xs text-slate-100 backdrop-blur-lg">
            {task.name}
          </div>
        </Html>
      ) : null}
    </group>
  );
}
