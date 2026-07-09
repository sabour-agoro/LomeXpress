import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative animate-pulse overflow-hidden rounded-2xl bg-muted",
        className,
      )}
      {...props}
    />
  );
}
