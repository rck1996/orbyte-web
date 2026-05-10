"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-8 whitespace-nowrap rounded-full border text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none",
  {
    variants: {
      variant: {
        primary:
          "border-transparent bg-foreground px-16 py-12 text-background shadow-[0_12px_32px_rgba(148,163,184,0.12)] hover:-translate-y-0.5 hover:bg-white",
        secondary:
          "border-border bg-surface px-16 py-12 text-foreground hover:-translate-y-0.5 hover:bg-surface-strong",
        ghost:
          "border-transparent bg-transparent px-12 py-12 text-muted-strong hover:bg-surface-soft hover:text-foreground",
      },
      size: {
        default: "h-48",
        sm: "h-48 px-12 text-xs",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
