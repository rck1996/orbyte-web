"use client";

import { motion } from "framer-motion";

import type { GalaxyNode } from "@/types/universe";

export function GalaxyRail({
  galaxies,
  selectedGalaxyId,
  onSelect,
}: {
  galaxies: GalaxyNode[];
  selectedGalaxyId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <motion.div
      className="flex w-full gap-12 overflow-x-auto rounded-[24px] border border-white/10 bg-slate-950/52 p-12 backdrop-blur-2xl xl:grid xl:max-w-[360px]"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
    >
      {galaxies.map((galaxy) => {
        const active = galaxy.id === selectedGalaxyId;

        return (
          <button
            key={galaxy.id}
            type="button"
            onClick={() => onSelect(galaxy.id)}
            className={`min-w-[220px] rounded-[20px] border px-16 py-12 text-left transition xl:min-w-0 ${
              active
                ? "border-white/18 bg-white/10"
                : "border-white/8 bg-white/[0.03] hover:bg-white/[0.06]"
            }`}
          >
            <div className="flex items-center justify-between gap-12">
              <p className="text-sm font-medium text-white">{galaxy.name}</p>
              <span
                className="size-12 rounded-full"
                style={{ backgroundColor: galaxy.color }}
              />
            </div>
            <p className="mt-8 text-xs uppercase tracking-[0.14em] text-slate-400">
              {galaxy.category}
            </p>
            <p className="mt-8 text-sm leading-[1.5] text-slate-300">{galaxy.description}</p>
          </button>
        );
      })}
    </motion.div>
  );
}
