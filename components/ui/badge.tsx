import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--successLight)] text-[var(--success)] hover:bg-opacity-60",
        secondary:
          "border-transparent bg-[var(--infoLight)] text-[var(--info)] hover:bg-opacity-60",
        pending:
          "border-transparent bg-[var(--warningsLight)] text-[var(--warnings)] hover:bg-opacity-60",
        destructive:
          "border-transparent bg-[var(--orangeLight)] text-[var(--orange)] hover:bg-opacity-60",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
