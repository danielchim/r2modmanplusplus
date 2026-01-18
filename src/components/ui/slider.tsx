"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "@base-ui/react/slider"
import { cn } from "@/lib/utils"

interface SliderProps extends Omit<SliderPrimitive.Root.Props, 'defaultValue' | 'value' | 'onValueChange'> {
  defaultValue?: number | number[]
  value?: number | number[]
  onValueChange?: (value: number | number[]) => void
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, defaultValue, value, onValueChange, ...props }, ref) => {
  // Convert to array format that Base UI expects
  const arrayValue = value !== undefined 
    ? (Array.isArray(value) ? value : [value])
    : undefined
  
  const arrayDefaultValue = defaultValue !== undefined
    ? (Array.isArray(defaultValue) ? defaultValue : [defaultValue])
    : undefined

  const handleValueChange = (newValue: number | readonly number[]) => {
    if (onValueChange) {
      // If original value was a single number, return single number
      if (typeof value === 'number' || typeof defaultValue === 'number') {
        onValueChange(Array.isArray(newValue) ? newValue[0] : newValue)
      } else {
        onValueChange(Array.isArray(newValue) ? [...newValue] : [newValue])
      }
    }
  }

  const thumbCount = arrayValue?.length || arrayDefaultValue?.length || 1

  return (
    <SliderPrimitive.Root
      ref={ref}
      value={arrayValue}
      defaultValue={arrayDefaultValue}
      onValueChange={handleValueChange}
      {...props}
    >
      <SliderPrimitive.Control className={cn("flex w-full touch-none items-center py-3 select-none", className)}>
        <SliderPrimitive.Track className="h-2 w-full rounded-full bg-muted shadow-[inset_0_0_0_1px] shadow-border select-none relative">
          <SliderPrimitive.Indicator className="absolute h-full rounded-full bg-primary select-none" />
          {Array.from({ length: thumbCount }).map((_, index) => (
            <SliderPrimitive.Thumb
              key={index}
              index={index}
              className="size-5 rounded-full bg-background border-2 border-primary select-none shadow-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2"
            />
          ))}
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
})
Slider.displayName = "Slider"

export { Slider }
