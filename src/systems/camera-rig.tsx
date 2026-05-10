"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

import { getSceneAnchor } from "@/lib/scene-anchors";
import { useUniverseStore } from "@/store/universe-store";

export function CameraRig() {
  const hoveredGalaxyId = useUniverseStore((state) => state.hoveredGalaxyId);
  const selectedGalaxyId = useUniverseStore((state) => state.selectedGalaxyId);
  const selectedObjectiveId = useUniverseStore((state) => state.selectedObjectiveId);
  const selectedTaskId = useUniverseStore((state) => state.selectedTaskId);

  const lookAt = useRef(new THREE.Vector3());
  const desiredPosition = useRef(new THREE.Vector3());
  const pointerBias = useRef(new THREE.Vector3());
  const smoothTarget = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    const camera = state.camera;
    const focusId =
      selectedTaskId ?? selectedObjectiveId ?? selectedGalaxyId ?? hoveredGalaxyId;
    const focus = getSceneAnchor(focusId);

    if (focus) {
      lookAt.current.set(focus[0], focus[1], focus[2]);
    } else {
      lookAt.current.set(0, 0, 0);
    }

    const depth =
      selectedTaskId ? 7 :
      selectedObjectiveId ? 11 :
      selectedGalaxyId ? 16 :
      30;
    const height =
      selectedTaskId ? 3 :
      selectedObjectiveId ? 5 :
      selectedGalaxyId ? 7 :
      10;

    // The pointer slightly biases the framing so the scene feels less static
    // while still preserving a stable focus target.
    pointerBias.current.set(state.pointer.x * 1.5, state.pointer.y * 0.8, 0);
    desiredPosition.current.set(
      lookAt.current.x + depth,
      lookAt.current.y + height,
      lookAt.current.z + depth * 1.2,
    );
    desiredPosition.current.add(pointerBias.current);

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
      THREE.MathUtils.damp(smoothTarget.current.x, lookAt.current.x, 4, delta),
      THREE.MathUtils.damp(smoothTarget.current.y, lookAt.current.y, 4, delta),
      THREE.MathUtils.damp(smoothTarget.current.z, lookAt.current.z, 4, delta),
    );
    camera.lookAt(smoothTarget.current);
  });

  return null;
}
