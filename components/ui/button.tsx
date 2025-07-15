import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-secondary to-primary text-primary-foreground hover:from-secondary/90 hover:to-primary/90 hover:text-white",
        destructive:
          "bg-red-700 text-white hover:bg-red-500 hover:text-white",
        outline:
          "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 ",
        success:
          "border border-green-600 bg-green-50 text-green-600 hover:bg-green-100 ",
        ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
        link: "text-blue-600 underline-offset-4 hover:underline hover:text-white",
        cancel:
          "bg-red-50 border border-red-600 hover:bg-red-100 text-red-500",
        outline2:
          "rounded-sm border border-border",
        outlineDate:
          "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 rounded-sm",

      },
      size: {
        default: "h-8 px-4 py-2",
        sm: "h-8 rounded-xl px-3",
        lg: "h-10 rounded-md  px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
