"use client";

import { useRef } from "react";
import { Canvas } from "@react-three/fiber";

import { UniverseScene } from "@/scene/universe-scene";
import { useUniverseStore } from "@/store/universe-store";
import type { UniverseData } from "@/types/universe";

export function UniverseCanvas({ universe }: { universe: UniverseData }) {
  const dragging = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const swipeVector = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragDistance = useRef(0);
  const interactionMode = useUniverseStore((state) => state.interactionMode);
  const stepSelection = useUniverseStore((state) => state.stepSelection);
  const panBy = useUniverseStore((state) => state.panBy);
  const suppressSceneClicks = useUniverseStore((state) => state.suppressSceneClicks);

  function finishGesture(pointerType: string, releasePointer?: () => void) {
    const isTouch = pointerType === "touch";
    const absX = Math.abs(swipeVector.current.x);
    const absY = Math.abs(swipeVector.current.y);

    if (isTouch && interactionMode === "guided" && absX > 44 && absX > absY * 1.2) {
      suppressSceneClicks(220);
      stepSelection(swipeVector.current.x < 0 ? "next" : "prev", universe);
    }

    const suppressThreshold = isTouch ? 14 : 18;

    if (dragDistance.current > suppressThreshold) {
      suppressSceneClicks(180);
    }

    dragging.current = false;
    releasePointer?.();
    lastPoint.current = null;
    swipeVector.current = { x: 0, y: 0 };
    dragDistance.current = 0;
  }

  return (
    <div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ touchAction: "none" }}
      onPointerDown={(event) => {
        dragging.current = true;
        event.currentTarget.setPointerCapture?.(event.pointerId);
        lastPoint.current = { x: event.clientX, y: event.clientY };
        swipeVector.current = { x: 0, y: 0 };
        dragDistance.current = 0;
      }}
      onPointerMove={(event) => {
        if (!dragging.current || !lastPoint.current) {
          return;
        }

        const deltaX = event.clientX - lastPoint.current.x;
        const deltaY = event.clientY - lastPoint.current.y;
        lastPoint.current = { x: event.clientX, y: event.clientY };
        swipeVector.current.x += deltaX;
        swipeVector.current.y += deltaY;
        dragDistance.current += Math.abs(deltaX) + Math.abs(deltaY);

        const isTouch = event.pointerType === "touch";

        if (!isTouch || interactionMode === "explore") {
          const speed = isTouch ? 0.08 : 0.18;
          panBy(-deltaX * speed, -deltaY * speed);
        }
      }}
      onPointerUp={(event) => {
        finishGesture(event.pointerType, () => {
          event.currentTarget.releasePointerCapture?.(event.pointerId);
        });
      }}
      onPointerCancel={(event) => {
        finishGesture(event.pointerType, () => {
          event.currentTarget.releasePointerCapture?.(event.pointerId);
        });
      }}
      onPointerLeave={() => {
        if (!dragging.current) {
          return;
        }

        finishGesture("mouse");
      }}
    >
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
