import type { ReactNode } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-16 px-12 py-16 md:gap-24 md:px-24 md:py-24 xl:flex-row">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col gap-24">
        <Topbar />
        <main className="grid gap-16 pb-24 md:gap-24">{children}</main>
      </div>
    </div>
  );
}
