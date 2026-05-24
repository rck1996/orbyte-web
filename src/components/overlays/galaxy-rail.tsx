"use client";

import { motion } from "framer-motion";

export type NavigationRailItem = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  accent: string;
  meta?: string;
};

export function GalaxyRail({
  label,
  items,
  activeId,
  onSelect,
  condensed = false,
}: {
  label: string;
  items: NavigationRailItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
  condensed?: boolean;
}) {
  return (
    <motion.div
      className={`w-full rounded-[20px] border border-white/10 bg-slate-950/52 backdrop-blur-2xl md:rounded-[24px] ${
        condensed ? "p-8" : "p-10 md:p-12"
      }`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
    >
      <div className={`flex items-center justify-between gap-12 border-b border-white/8 ${condensed ? "pb-6" : "pb-8"}`}>
        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{label}</p>
        <span className="text-xs text-slate-500">{items.length}</span>
      </div>

      <div
        className={`flex gap-8 overflow-x-auto pb-4 ${condensed ? "mt-8 max-h-[480px] flex-col overflow-y-auto overflow-x-hidden pr-2" : "mt-12 snap-x snap-mandatory md:grid md:max-h-[280px] md:overflow-x-hidden md:overflow-y-auto md:pr-4"}`}
        style={{ touchAction: condensed ? "pan-y" : "pan-x" }}
      >
        {items.map((item) => {
          const active = item.id === activeId;

          return (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`group relative ${condensed ? "min-w-0" : "min-w-[220px] snap-start md:min-w-0"} rounded-[16px] border text-left transition md:rounded-[18px] ${
                condensed ? "px-8 py-8" : "px-10 py-10 md:px-12"
              } ${
                active
                  ? "border-white/18 bg-white/10 shadow-[0_18px_50px_rgba(148,163,184,0.12)]"
                  : "border-white/8 bg-white/[0.03] hover:border-white/14 hover:bg-white/[0.06]"
              }`}
              initial={{ opacity: 0, x: condensed ? -6 : 0, y: condensed ? 0 : 6 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: condensed ? 0 : -2 }}
              whileTap={{ scale: 0.99 }}
            >
              <div
                className={`absolute inset-y-10 left-0 w-[3px] rounded-full transition ${
                  active ? "opacity-100" : "opacity-0 group-hover:opacity-60"
                }`}
                style={{ backgroundColor: item.accent }}
              />
              <div className="flex items-center justify-between gap-12">
                <p className={`${condensed ? "text-xs" : "text-sm"} font-medium text-white`}>{item.title}</p>
                <div className="flex items-center gap-8">
                  {item.meta ? (
                    <span className="rounded-full border border-white/8 bg-white/[0.04] px-8 py-4 text-[10px] text-slate-400">
                      {item.meta}
                    </span>
                  ) : null}
                  <span
                    className="size-10 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.16)]"
                    style={{ backgroundColor: item.accent }}
                  />
                </div>
              </div>
              <div className={`${condensed ? "mt-4" : "mt-6"} flex items-center justify-between gap-12`}>
                <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
                  {item.subtitle}
                </p>
                <span className={`text-[10px] transition ${active ? "text-slate-300" : "text-slate-500"}`}>
                  {active ? "Focused" : "Select"}
                </span>
              </div>
              <p className={`${condensed ? "mt-6 line-clamp-1 text-xs" : "mt-8 line-clamp-2 text-sm md:line-clamp-none"} leading-[1.5] text-slate-300`}>
                {item.description}
              </p>
              <div className="mt-8 h-[2px] overflow-hidden rounded-full bg-white/6">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.accent }}
                  initial={{ width: 0 }}
                  animate={{ width: active ? "100%" : "46%" }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </motion.button>
          );
        })}

        {items.length === 0 ? (
          <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-12 py-10 text-sm text-slate-300">
            No items available at this level yet.
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
