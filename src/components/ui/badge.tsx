import { cn } from "@/lib/utils";
export function Badge({ className, variant = "secondary", ...props }:{className?:string;variant?:"default"|"secondary"} & React.HTMLAttributes<HTMLDivElement>) {
  const styles = variant === "default" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground";
  return <div className={cn("inline-flex items-center rounded-md px-2 py-1 text-xs", styles, className)} {...props} />;
}
