import * as React from "react";

import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "surface-card rounded-[32px] border border-border/80 p-24 shadow-[0_18px_80px_rgba(2,6,23,0.28)]",
        className,
      )}
      {...props}
    />
  );
}
