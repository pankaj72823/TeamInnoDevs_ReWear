import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-orange-600",
  {
    variants: {
      variant: {
        default:
          "bg-orange-500 text-white rounded-full hover:bg-orange-600",
        destructive:
          "bg-red-600 text-white rounded-full hover:bg-red-700",
        outline:
          "border border-orange-500 text-orange-500 rounded-full hover:bg-orange-50",
        secondary:
          "bg-gray-200 text-gray-900 rounded-full hover:bg-gray-300",
        ghost:
          "hover:bg-orange-50 text-orange-600 rounded-full",
        link:
          "text-orange-600 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-8 text-base",
        sm: "h-10 px-6 text-sm",
        lg: "h-14 px-10 text-lg",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)


function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />
  );
}

export { Button, buttonVariants }
