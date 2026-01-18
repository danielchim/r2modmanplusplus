import type { Mod } from "@/mocks/mods"

import { Download, Trash2 } from "lucide-react"
import { useAppStore } from "@/store/app-store"
import { useModManagementStore } from "@/store/mod-management-store"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type ModTileProps = {
  mod: Mod
}

export function ModTile({ mod }: ModTileProps) {
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
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-md border bg-card text-left transition-colors cursor-pointer",
        "hover:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isSelected ? "border-ring" : "border-border"
      )}
      onClick={() => selectMod(mod.id)}
    >
      {/* Mod Icon */}
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={mod.iconUrl}
          alt={mod.name}
          className="size-full object-cover transition-transform group-hover:scale-105"
        />
      </div>

      {/* Mod Info */}
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-1 text-sm font-semibold">{mod.name}</h3>
        <p className="text-xs text-muted-foreground">by {mod.author}</p>
        
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">
            {mod.downloads.toLocaleString()} downloads
          </span>
          
          {/* Enable Toggle Indicator */}
          <div
            className={cn(
              "size-2 rounded-full",
              mod.isEnabled && isInstalled ? "bg-primary" : "bg-muted-foreground/30"
            )}
          />
        </div>

        {/* Download/Uninstall Button */}
        <Button
          variant={isInstalled ? "outline" : "default"}
          size="sm"
          className="mt-2 w-full"
          onClick={handleActionClick}
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
      </div>

      {/* Status Badge */}
      {isInstalled && mod.isEnabled && (
        <div className="absolute right-2 top-2 rounded bg-primary/90 px-2 py-0.5 text-xs font-medium text-primary-foreground">
          Active
        </div>
      )}
    </div>
  )
}
