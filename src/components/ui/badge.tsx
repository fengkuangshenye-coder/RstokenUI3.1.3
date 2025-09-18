// src/components/ui/badge.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const styles =
    variant === "secondary"
      ? "bg-white/10 text-white border border-white/10"
      : variant === "outline"
      ? "bg-transparent text-white border border-white/20"
      : "bg-slate-100 text-slate-900";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium",
        styles,
        className
      )}
      {...props}
    />
  );
}

