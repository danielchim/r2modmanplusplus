import type { Mod } from "@/mocks/mods"

import { useState, useMemo } from "react"
import { Download, Trash2, Loader2, Pause, AlertTriangle } from "lucide-react"
import { useAppStore } from "@/store/app-store"
import { useModManagementStore } from "@/store/mod-management-store"
import { useDownloadStore } from "@/store/download-store"
import { useSettingsStore } from "@/store/settings-store"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { DependencyDownloadDialog } from "@/components/features/dependencies/dependency-download-dialog"
import { analyzeModDependencies } from "@/lib/dependency-utils"
import { MODS } from "@/mocks/mods"

type ModListItemProps = {
  mod: Mod
}

export function ModListItem({ mod }: ModListItemProps) {
  const selectMod = useAppStore((s) => s.selectMod)
  const selectedModId = useAppStore((s) => s.selectedModId)
  const selectedGameId = useAppStore((s) => s.selectedGameId)
  
  const toggleMod = useModManagementStore((s) => s.toggleMod)
  const uninstallMod = useModManagementStore((s) => s.uninstallMod)
  const getDependencyWarnings = useModManagementStore((s) => s.getDependencyWarnings)
  const installedVersionsByGame = useModManagementStore((s) => s.installedModVersionsByGame)
  const enforceDependencyVersions = useSettingsStore((s) => s.global.enforceDependencyVersions)
  
  const startDownload = useDownloadStore((s) => s.startDownload)
  
  const [showDependencyDialog, setShowDependencyDialog] = useState(false)

  const isSelected = selectedModId === mod.id
  
  // Subscribe to the Sets directly, not derived booleans
  const installedSet = useModManagementStore((s) => s.installedModsByGame[selectedGameId])
  const enabledSet = useModManagementStore((s) => s.enabledModsByGame[selectedGameId])
  const uninstallingSet = useModManagementStore((s) => s.uninstallingMods)
  
  // Subscribe to download task
  const downloadTask = useDownloadStore((s) => s.tasks[mod.id])
  
  // Derive booleans from Sets
  const isInstalled = installedSet ? installedSet.has(mod.id) : false
  const isEnabled = enabledSet ? enabledSet.has(mod.id) : false
  const isUninstalling = uninstallingSet.has(mod.id)
  
  // Check for dependency warnings
  const depWarnings = getDependencyWarnings(selectedGameId, mod.id)
  const hasWarnings = isInstalled && depWarnings.length > 0
  
  // Check download states
  const isDownloading = downloadTask?.status === "downloading"
  const isQueued = downloadTask?.status === "queued"
  const isPaused = downloadTask?.status === "paused"
  const hasDownloadTask = isDownloading || isQueued || isPaused
  
  // Analyze dependencies
  const depInfos = useMemo(() => {
    const installedVersions = installedVersionsByGame[mod.gameId] || {}
    return analyzeModDependencies({
      mod,
      mods: MODS,
      installedVersions,
      enforceVersions: enforceDependencyVersions,
    })
  }, [mod, installedVersionsByGame, enforceDependencyVersions])

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isInstalled) {
      uninstallMod(selectedGameId, mod.id)
    } else {
      // Check if there are any dependencies that need to be installed
      const hasDepsToInstall = depInfos.some(dep => 
        dep.resolvedMod && 
        (dep.status === "not_installed" || dep.status === "installed_wrong")
      )
      
      if (hasDepsToInstall) {
        // Show dialog to let user choose which dependencies to install
        setShowDependencyDialog(true)
      } else {
        // No dependencies or all are already installed correctly, download directly
        startDownload(mod.id, mod.gameId, mod.name, mod.version, mod.author)
      }
    }
  }

  return (
    <>
      <DependencyDownloadDialog 
        mod={mod} 
        open={showDependencyDialog} 
        onOpenChange={setShowDependencyDialog}
      />
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
          {isInstalled && isEnabled && (
            <span className="rounded bg-primary/90 px-2 py-0.5 text-xs font-medium text-primary-foreground">
              Active
            </span>
          )}
          {hasWarnings && (
            <span className="rounded bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-600 dark:text-yellow-500 flex items-center gap-1">
              <AlertTriangle className="size-3" />
              Missing deps
            </span>
          )}
          {isQueued && (
            <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
              Queued
            </span>
          )}
          {isPaused && (
            <span className="rounded bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-600 dark:text-yellow-500">
              Paused
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">by {mod.author}</p>
        <p className="line-clamp-1 text-xs text-muted-foreground">{mod.description}</p>
        
        {/* Download Progress */}
        {isDownloading && downloadTask && (
          <div className="flex items-center gap-2 mt-1">
            <Progress value={downloadTask.progress} className="h-1.5 flex-1" />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {downloadTask.progress.toFixed(0)}%
            </span>
          </div>
        )}
      </div>
      {/* Enable/Disable Toggle */}
      {isInstalled && !isUninstalling && (
        <div className="flex shrink-0 items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <span className="text-sm text-muted-foreground">Enabled</span>
          <Switch 
            checked={isEnabled} 
            onCheckedChange={() => toggleMod(selectedGameId, mod.id)}
          />
        </div>
      )}

      {/* Mod Stats */}
      <div className="flex shrink-0 flex-col items-end gap-1 text-xs text-muted-foreground">
        <span>{mod.version}</span>
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
    </>
  )
}
