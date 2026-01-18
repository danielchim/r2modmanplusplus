import type { Mod } from "@/mocks/mods"

import { Download, Trash2 } from "lucide-react"
import { useAppStore } from "@/store/app-store"
import { useModManagementStore } from "@/store/mod-management-store"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type ModListItemProps = {
  mod: Mod
}

export function ModListItem({ mod }: ModListItemProps) {
  const selectMod = useAppStore((s) => s.selectMod)
  const selectedModId = useAppStore((s) => s.selectedModId)
  const selectedGameId = useAppStore((s) => s.selectedGameId)
  const isModInstalled = useModManagementStore((s) => s.isModInstalled)
  const installMod = useModManagementStore((s) => s.installMod)
  const uninstallMod = useModManagementStore((s) => s.uninstallMod)

  const isSelected = selectedModId === mod.id
  const isInstalled = isModInstalled(selectedGameId, mod.id)

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isInstalled) {
      uninstallMod(selectedGameId, mod.id)
    } else {
      installMod(selectedGameId, mod.id)
    }
  }

  return (
    <div
      onClick={() => selectMod(mod.id)}
      className={cn(
        "group flex w-full items-center gap-4 rounded-md border bg-card p-3 text-left transition-colors cursor-pointer",
        "hover:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isSelected ? "border-ring" : "border-border"
      )}
    >
      {/* Mod Icon */}
      <div className="size-16 shrink-0 overflow-hidden rounded bg-muted">
        <img
          src={mod.iconUrl}
          alt={mod.name}
          className="size-full object-cover transition-transform group-hover:scale-105"
        />
      </div>

      {/* Mod Info */}
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">{mod.name}</h3>
          {isInstalled && mod.isEnabled && (
            <span className="rounded bg-primary/90 px-2 py-0.5 text-xs font-medium text-primary-foreground">
              Active
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">by {mod.author}</p>
        <p className="line-clamp-1 text-xs text-muted-foreground">{mod.description}</p>
      </div>

      {/* Mod Stats */}
      <div className="flex shrink-0 flex-col items-end gap-1 text-xs text-muted-foreground">
        <span>{mod.version}</span>
        <span>{mod.downloads.toLocaleString()} downloads</span>
        <span>{new Date(mod.lastUpdated).toLocaleDateString()}</span>
      </div>

      {/* Download/Uninstall Button */}
      <Button
        variant={isInstalled ? "outline" : "default"}
        size="sm"
        onClick={handleActionClick}
        className="shrink-0"
      >
        {isInstalled ? (
          <>
            <Trash2 className="size-3 mr-1.5" />
            Uninstall
          </>
        ) : (
          <>
            <Download className="size-3 mr-1.5" />
            Download
          </>
        )}
      </Button>

      {/* Enable Indicator */}
      <div
        className={cn(
          "size-3 shrink-0 rounded-full",
          mod.isEnabled && isInstalled ? "bg-primary" : "bg-muted-foreground/30"
        )}
      />
    </div>
  )
}
