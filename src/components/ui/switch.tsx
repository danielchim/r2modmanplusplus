"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-6 w-10 rounded-full p-px outline outline-1 -outline-offset-1",
      "bg-muted outline-border transition-colors duration-200",
      "data-[checked]:bg-primary data-[checked]:outline-primary",
      "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        "aspect-square h-full rounded-full bg-background",
        "shadow-sm transition-transform duration-150",
        "data-[checked]:translate-x-4"
      )}
    />
  </SwitchPrimitive.Root>
))
Switch.displayName = "Switch"

export { Switch }
