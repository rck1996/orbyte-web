"use client";

import { Float, Stars } from "@react-three/drei";
import { useMemo } from "react";

import { GalaxyNode } from "@/components/galaxy/galaxy-node";
import { CameraRig } from "@/systems/camera-rig";
import type { UniverseData } from "@/types/universe";

export function UniverseScene({ universe }: { universe: UniverseData }) {
  const mapPositions = useMemo(() => {
    const count = Math.max(universe.galaxies.length, 1);
    const largestSystemRadius = universe.galaxies.reduce((largestGalaxy, galaxy) => {
      const galaxySystemRadius = galaxy.objectives.reduce((largestObjective, objective) => {
        const farthestTaskOrbit =
          objective.tasks.length > 0 ? 2.9 + (objective.tasks.length - 1) * 1.55 : 2.9;
        return Math.max(largestObjective, Math.max(objective.orbitRadius + 0.2, farthestTaskOrbit) + 4.2);
      }, 8.5);

      return Math.max(largestGalaxy, galaxySystemRadius);
    }, 10);

    const adjacentSpacing = largestSystemRadius * 2.9;
    const ringRadius =
      count > 1
        ? adjacentSpacing / (2 * Math.sin(Math.PI / count))
        : 0;
    const layoutRadius = Math.max(ringRadius, largestSystemRadius + 10);

    return universe.galaxies.map((galaxy, index) => {
      if (count === 1) {
        return [0, 0, 0] as [number, number, number];
      }

      const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
      return [
        Math.cos(angle) * layoutRadius,
        galaxy.position[1] * 0.4,
        Math.sin(angle) * layoutRadius,
      ] as [number, number, number];
    });
  }, [universe.galaxies]);

  return (
    <>
      <color attach="background" args={["#030712"]} />
      <fog attach="fog" args={["#030712", 28, 64]} />
      <ambientLight intensity={0.85} />
      <hemisphereLight intensity={0.5} color="#dbeafe" groundColor="#020617" />
      <pointLight position={[0, 12, 18]} intensity={85} color="#89c2ff" />
      <pointLight position={[-18, -8, -12]} intensity={28} color="#c084fc" />
      <pointLight position={[18, 10, -10]} intensity={24} color="#34d399" />

      <Float speed={0.6} rotationIntensity={0.08} floatIntensity={0.35}>
        <group>
          {universe.galaxies.map((galaxy, index) => (
            <GalaxyNode key={galaxy.id} galaxy={galaxy} mapPosition={mapPositions[index]} />
          ))}
        </group>
      </Float>

      <mesh rotation-x={-Math.PI / 2} position={[0, -8, 0]}>
        <circleGeometry args={[80, 96]} />
        <meshBasicMaterial color="#0f172a" transparent opacity={0.22} />
      </mesh>

      <Stars
        radius={90}
        depth={50}
        count={900}
        factor={2.2}
        saturation={0}
        fade
        speed={0.16}
      />
      <CameraRig />
    </>
  );
}
