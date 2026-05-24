"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

import { getSceneAnchor } from "@/lib/scene-anchors";
import { useUniverseStore } from "@/store/universe-store";

export function CameraRig() {
  const selectedGalaxyId = useUniverseStore((state) => state.selectedGalaxyId);
  const selectedObjectiveId = useUniverseStore((state) => state.selectedObjectiveId);
  const selectedTaskId = useUniverseStore((state) => state.selectedTaskId);
  const dragOffset = useUniverseStore((state) => state.dragOffset);

  const lookAt = useRef(new THREE.Vector3());
  const desiredPosition = useRef(new THREE.Vector3());
  const smoothTarget = useRef(new THREE.Vector3());
  const dragBias = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    const camera = state.camera;
    const focusId = selectedTaskId ?? selectedObjectiveId ?? selectedGalaxyId;
    const focus = getSceneAnchor(focusId);

    const depth = selectedTaskId ? 7 : selectedObjectiveId ? 11 : selectedGalaxyId ? 16 : 30;
    const height = selectedTaskId ? 3 : selectedObjectiveId ? 5 : selectedGalaxyId ? 7 : 10;
    const panScale = selectedTaskId ? 0.12 : selectedObjectiveId ? 0.22 : selectedGalaxyId ? 0.35 : 0.7;

    dragBias.current.set(
      dragOffset.x * panScale,
      0,
      dragOffset.y * panScale,
    );

    if (focus) {
      lookAt.current.set(
        focus[0] + dragBias.current.x,
        focus[1],
        focus[2] + dragBias.current.z,
      );
    } else {
      lookAt.current.set(dragBias.current.x, 0, dragBias.current.z);
    }

    desiredPosition.current.set(
      lookAt.current.x + depth,
      lookAt.current.y + height,
      lookAt.current.z + depth * 1.2,
    );

    camera.position.x = THREE.MathUtils.damp(
      camera.position.x,
      desiredPosition.current.x,
      3.6,
      delta,
    );
    camera.position.y = THREE.MathUtils.damp(
      camera.position.y,
      desiredPosition.current.y,
      3.2,
      delta,
    );
    camera.position.z = THREE.MathUtils.damp(
      camera.position.z,
      desiredPosition.current.z,
      3.6,
      delta,
    );

    smoothTarget.current.set(
      THREE.MathUtils.damp(
        smoothTarget.current.x,
        lookAt.current.x,
        4,
        delta,
      ),
      THREE.MathUtils.damp(
        smoothTarget.current.y,
        lookAt.current.y,
        4,
        delta,
      ),
      THREE.MathUtils.damp(
        smoothTarget.current.z,
        lookAt.current.z,
        4,
        delta,
      ),
    );
    camera.lookAt(smoothTarget.current);
  });

  return null;
}
