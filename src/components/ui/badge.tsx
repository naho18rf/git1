import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-medium leading-5 transition-colors [&_svg]:size-3.5",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        rose: "bg-rose-pale text-primary-deep",
        mint: "bg-mint text-primary",
        outline: "border border-border bg-surface text-foreground",
        deep: "bg-deep-foreground/10 text-deep-foreground",
        destructive: "bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "mint",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
