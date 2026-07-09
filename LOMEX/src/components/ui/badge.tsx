import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary ring-1 ring-inset ring-primary/20",
        accent: "bg-accent/15 text-[#0d7ea7] ring-1 ring-inset ring-accent/25",
        success: "bg-emerald-500/15 text-emerald-700 ring-1 ring-inset ring-emerald-500/30",
        warning: "bg-amber-500/15 text-amber-700 ring-1 ring-inset ring-amber-500/30",
        outline: "border border-border bg-transparent text-muted-foreground",
        muted: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
