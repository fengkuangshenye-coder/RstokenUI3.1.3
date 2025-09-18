import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-xl border border-white/10 bg-white/10 px-2 py-0.5 text-xs",
        className
      )}
      {...props}
    />
  );
}

