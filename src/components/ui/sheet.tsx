"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./dialog"

const Sheet = Dialog
const SheetTrigger = DialogTrigger
const SheetClose = DialogClose
const SheetPortal = DialogPortal

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogContent> {
  side?: "left" | "right" | "top" | "bottom"
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <DialogOverlay />
    <DialogContent
      ref={ref}
      className={cn(
        "fixed z-50 bg-background ring-1 ring-foreground/10 p-6 outline-none",
        // Base animation classes
        "data-open:animate-in data-closed:animate-out duration-200",
        // Side-specific positioning and animations
        side === "left" && [
          "inset-y-0 left-0 h-full w-[85vw] max-w-sm",
          "data-closed:slide-out-to-left data-open:slide-in-from-left",
        ],
        side === "right" && [
          "inset-y-0 right-0 h-full w-[85vw] max-w-sm",
          "data-closed:slide-out-to-right data-open:slide-in-from-right",
        ],
        side === "top" && [
          "inset-x-0 top-0 w-full",
          "data-closed:slide-out-to-top data-open:slide-in-from-top",
        ],
        side === "bottom" && [
          "inset-x-0 bottom-0 w-full",
          "data-closed:slide-out-to-bottom data-open:slide-in-from-bottom",
        ],
        className
      )}
      {...props}
    >
      {children}
    </DialogContent>
  </SheetPortal>
))
SheetContent.displayName = "SheetContent"

function SheetHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function SheetFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2",
        className
      )}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogTitle>) {
  return (
    <DialogTitle
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogDescription>) {
  return (
    <DialogDescription
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
