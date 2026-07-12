"use client";

import { RefreshCw } from "lucide-react";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#020617] p-20 text-white">
      <section className="max-w-md rounded-[28px] border border-white/10 bg-slate-950/70 p-24 text-center shadow-2xl">
        <p className="text-xs uppercase tracking-[0.18em] text-rose-300">Algo salió mal</p>
        <h1 className="mt-10 text-3xl font-semibold tracking-[-0.04em]">No pudimos abrir tu universo.</h1>
        <p className="mt-10 text-sm leading-[1.7] text-slate-400">Tus datos siguen guardados en este navegador. Intenta cargar la vista nuevamente.</p>
        <button type="button" onClick={reset} className="mt-16 inline-flex items-center gap-8 rounded-full bg-white px-14 py-9 text-sm font-medium text-slate-950 transition hover:bg-sky-100">
          <RefreshCw className="size-15" /> Reintentar
        </button>
      </section>
    </main>
  );
}
