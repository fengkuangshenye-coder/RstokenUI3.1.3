// src/components/ui/input.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none ring-offset-slate-950 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-cyan-400/50",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
