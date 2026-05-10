"use client";

import { Float, Stars } from "@react-three/drei";

import { GalaxyNode } from "@/components/galaxy/galaxy-node";
import { CameraRig } from "@/systems/camera-rig";
import type { UniverseData } from "@/types/universe";

export function UniverseScene({ universe }: { universe: UniverseData }) {
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
          {universe.galaxies.map((galaxy) => (
            <GalaxyNode key={galaxy.id} galaxy={galaxy} />
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
