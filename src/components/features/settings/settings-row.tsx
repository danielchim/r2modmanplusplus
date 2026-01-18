import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface SettingsRowProps {
  title: string
  description?: string
  value?: string
  rightContent?: ReactNode
  className?: string
}

export function SettingsRow({
  title,
  description,
  value,
  rightContent,
  className,
}: SettingsRowProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-8 py-6",
        className
      )}
    >
      <div className="flex-1 min-w-0 space-y-1">
        <div className="text-sm font-medium text-foreground">{title}</div>
        {description && (
          <div className="text-sm text-muted-foreground">
            {description}
          </div>
        )}
        {value && (
          <div className="text-xs text-muted-foreground font-mono">
            {value}
          </div>
        )}
      </div>
      {rightContent && (
        <div className="flex-shrink-0 flex items-start pt-0.5">{rightContent}</div>
      )}
    </div>
  )
}
