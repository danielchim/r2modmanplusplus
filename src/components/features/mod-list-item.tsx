import type { Mod } from "@/mocks/mods"

import { memo } from "react"
import { Download, Trash2, Loader2, Pause, AlertTriangle } from "lucide-react"
import { useAppStore } from "@/store/app-store"
import { useModManagementStore } from "@/store/mod-management-store"
import { useProfileStore } from "@/store/profile-store"
import { useDownloadStore } from "@/store/download-store"
import { useDownloadActions } from "@/hooks/use-download-actions"
import { useModActions } from "@/hooks/use-mod-actions"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { isVersionGreater } from "@/lib/version-utils"

type ModListItemProps = {
  mod: Mod
  onOpenDependencyDialog?: (mod: Mod, version: string) => void
}

export const ModListItem = memo(function ModListItem({ mod, onOpenDependencyDialog }: ModListItemProps) {
  const selectMod = useAppStore((s) => s.selectMod)
  const selectedModId = useAppStore((s) => s.selectedModId)
  const selectedGameId = useAppStore((s) => s.selectedGameId)
  
  const toggleMod = useModManagementStore((s) => s.toggleMod)
  const { uninstallMod } = useModActions()
  const getDependencyWarnings = useModManagementStore((s) => s.getDependencyWarnings)
  const installedVersionsByProfile = useModManagementStore((s) => s.installedModVersionsByProfile)
  
  const activeProfileId = useProfileStore((s) => selectedGameId ? s.activeProfileIdByGame[selectedGameId] : undefined)
  
  const { startDownload } = useDownloadActions()

  const isSelected = selectedModId === mod.id
  
  // Subscribe to the Sets directly, not derived booleans
  const installedSet = useModManagementStore((s) => 
    activeProfileId ? s.installedModsByProfile[activeProfileId] : undefined
  )
  const enabledSet = useModManagementStore((s) => 
    activeProfileId ? s.enabledModsByProfile[activeProfileId] : undefined
  )
  const uninstallingSet = useModManagementStore((s) => s.uninstallingMods)
  
  // Subscribe to download task
  const downloadTask = useDownloadStore((s) => s.tasks[mod.id])
  
  // Derive booleans from Sets
  const isInstalled = installedSet ? installedSet.has(mod.id) : false
  const isEnabled = enabledSet ? enabledSet.has(mod.id) : false
  const isUninstalling = uninstallingSet.has(mod.id)
  
  // Check for dependency warnings
  const depWarnings = activeProfileId ? getDependencyWarnings(activeProfileId, mod.id) : []
  const hasWarnings = isInstalled && depWarnings.length > 0
  
  // Check download states
  const isDownloading = downloadTask?.status === "downloading"
  const isQueued = downloadTask?.status === "queued"
  const isPaused = downloadTask?.status === "paused"
  const hasDownloadTask = isDownloading || isQueued || isPaused

  // Get the actually installed version
  const installedVersion = activeProfileId ? installedVersionsByProfile[activeProfileId]?.[mod.id] : undefined
  const hasUpdate = isInstalled && installedVersion && isVersionGreater(mod.version, installedVersion)

  // Early return if no game selected (shouldn't happen, but type-safe)
  if (!selectedGameId) {
    return null
  }

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!activeProfileId) return
    
    if (isInstalled) {
      uninstallMod(activeProfileId, mod.id, { author: mod.author, name: mod.name })
    } else {
      // Keep list items cheap: only do dependency resolution inside the dependency dialog.
      // If there are no dependencies, download directly.
      if (mod.dependencies.length > 0 && onOpenDependencyDialog) {
        onOpenDependencyDialog(mod, mod.version)
      } else {
        const versionData = mod.versions.find(v => v.version_number === mod.version)
        const downloadUrl = versionData?.download_url || ""
        
        startDownload({
          gameId: mod.gameId,
          modId: mod.id,
          modName: mod.name,
          modVersion: mod.version,
          modAuthor: mod.author,
          modIconUrl: mod.iconUrl,
          downloadUrl
        })
      }
    }
  }

  return (
      <div
      onClick={() => selectMod(mod.id)}
      className={cn(
        "group flex w-full items-center gap-4 rounded-md border bg-card p-3 text-left transition-colors cursor-pointer h-[80px]",
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
          {isInstalled && isEnabled && !hasUpdate && (
            <span className="rounded bg-primary/90 px-2 py-0.5 text-xs font-medium text-primary-foreground">
              Active
            </span>
          )}
          {hasUpdate && !hasWarnings && (
            <span className="rounded bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-500">
              Update available
            </span>
          )}
          {hasWarnings && (
            <span className="rounded bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-600 dark:text-yellow-500 flex items-center gap-1">
              <AlertTriangle className="size-3" />
              Missing deps
            </span>
          )}
          {isQueued && !hasUpdate && (
            <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
              Queued
            </span>
          )}
          {isPaused && !hasUpdate && (
            <span className="rounded bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-600 dark:text-yellow-500">
              Paused
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">by {mod.author}</p>
        <p className="line-clamp-1 text-xs text-muted-foreground">{mod.description}</p>
        
        {/* Download Progress */}
        {isDownloading && downloadTask ? (
          <div className="flex items-center gap-2 mt-1">
            <Progress value={downloadTask.progress} className="h-1.5 flex-1" />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {downloadTask.progress.toFixed(0)}%
            </span>
          </div>
        ) : null}
      </div>
      {/* Enable/Disable Toggle */}
      {isInstalled && !isUninstalling ? (
        <div className="flex shrink-0 items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <span className="text-sm text-muted-foreground">Enabled</span>
          <Switch
            checked={isEnabled}
            onCheckedChange={() => activeProfileId && toggleMod(activeProfileId, mod.id)}
          />
        </div>
      ) : null}

      {/* Mod Stats */}
      <div className="flex shrink-0 flex-col items-end gap-1 text-xs text-muted-foreground">
        <span>{installedVersion ?? mod.version}</span>
        <span>{mod.downloads.toLocaleString()} downloads</span>
        <span>{new Date(mod.lastUpdated).toLocaleDateString()}</span>
      </div>
      

      {/* Download/Uninstall Button */}
      <Button
        variant={isInstalled ? "destructive" : "default"}
        size="sm"
        onClick={handleActionClick}
        className="shrink-0"
        disabled={hasDownloadTask || isUninstalling}
      >
        {isInstalled ? (
          <>
            {isUninstalling ? (
              <>
                <Loader2 className="size-3 mr-1.5 animate-spin" />
                Uninstalling
              </>
            ) : (
              <>
                <Trash2 className="size-3 mr-1.5" />
                Uninstall
              </>
            )}
          </>
        ) : hasDownloadTask ? (
          <>
            {isDownloading && <Loader2 className="size-3 mr-1.5 animate-spin" />}
            {isPaused && <Pause className="size-3 mr-1.5" />}
            {isQueued ? "Queued" : isPaused ? "Paused" : "Downloading"}
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
          isEnabled && isInstalled ? "bg-primary" : "bg-muted-foreground/30"
        )}
      />
    </div>
  )
})
