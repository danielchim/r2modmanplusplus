import type { Mod } from "@/mocks/mods"

import { useState, useMemo, memo } from "react"
import { Download, Trash2, Loader2, Pause, AlertTriangle } from "lucide-react"
import { useAppStore } from "@/store/app-store"
import { useModManagementStore } from "@/store/mod-management-store"
import { useProfileStore } from "@/store/profile-store"
import { useDownloadStore } from "@/store/download-store"
import { useDownloadActions } from "@/hooks/use-download-actions"
import { useModActions } from "@/hooks/use-mod-actions"
import { useSettingsStore } from "@/store/settings-store"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { DependencyDownloadDialog } from "@/components/features/dependencies/dependency-download-dialog"
import { analyzeModDependencies } from "@/lib/dependency-utils"
import { isVersionGreater } from "@/lib/version-utils"
import { useOnlineDependencies } from "@/lib/queries/useOnlineMods"
import { MODS } from "@/mocks/mods"

type ModTileProps = {
  mod: Mod
}

export const ModTile = memo(function ModTile({ mod }: ModTileProps) {
  const selectMod = useAppStore((s) => s.selectMod)
  const selectedModId = useAppStore((s) => s.selectedModId)
  const selectedGameId = useAppStore((s) => s.selectedGameId)
  
  const toggleMod = useModManagementStore((s) => s.toggleMod)
  const { uninstallMod } = useModActions()
  const getDependencyWarnings = useModManagementStore((s) => s.getDependencyWarnings)
  const installedVersionsByProfile = useModManagementStore((s) => s.installedModVersionsByProfile)
  const enforceDependencyVersions = useSettingsStore((s) => s.global.enforceDependencyVersions)
  
  const activeProfileId = useProfileStore((s) => selectedGameId ? s.activeProfileIdByGame[selectedGameId] : undefined)
  
  const { startDownload } = useDownloadActions()
  
  const [showDependencyDialog, setShowDependencyDialog] = useState(false)

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

  // Extract primitive dependencies for useMemo (rerender-dependencies)
  const installedVersionsForProfile = activeProfileId ? installedVersionsByProfile[activeProfileId] : undefined

  // Check if this is a Thunderstore online mod (UUID format: 36 chars with hyphens)
  const isThunderstoreMod = mod.id.length === 36 && mod.id.includes("-")

  // Use online dependency resolution for Thunderstore mods in Electron
  const onlineDepsQuery = useOnlineDependencies({
    gameId: mod.gameId,
    dependencies: mod.dependencies,
    installedVersions: installedVersionsForProfile || {},
    enforceVersions: enforceDependencyVersions,
    enabled: isThunderstoreMod,
  })

  // Analyze dependencies (use online for Thunderstore mods if available, otherwise use mock)
  const depInfos = useMemo(() => {
    // If we have online dependency data, use it
    if (isThunderstoreMod && onlineDepsQuery.isElectron && onlineDepsQuery.data) {
      return onlineDepsQuery.data
    }

    // Fallback to mock catalog analysis
    const installedVersions = installedVersionsForProfile || {}
    return analyzeModDependencies({
      mod,
      mods: MODS,
      installedVersions,
      enforceVersions: enforceDependencyVersions,
    })
  }, [isThunderstoreMod, onlineDepsQuery.isElectron, onlineDepsQuery.data, mod, installedVersionsForProfile, enforceDependencyVersions])

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!activeProfileId) return
    
    if (isInstalled) {
      uninstallMod(activeProfileId, mod.id, { author: mod.author, name: mod.name })
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
    <>
      <DependencyDownloadDialog 
        mod={mod} 
        requestedVersion={mod.version}
        open={showDependencyDialog} 
        onOpenChange={setShowDependencyDialog}
      />
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
        
        {/* Download Progress */}
        {isDownloading && downloadTask ? (
          <div className="flex flex-col gap-1 mt-1">
            <Progress value={downloadTask.progress} className="h-1.5" />
            <span className="text-xs text-muted-foreground">
              {downloadTask.progress.toFixed(0)}% • {(downloadTask.speedBps / 1024 / 1024).toFixed(2)} MB/s
            </span>
          </div>
        ) : null}
        
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">
            {mod.downloads.toLocaleString()} downloads
          </span>
          
          {/* Enable Toggle Indicator */}
          <div
            className={cn(
              "size-2 rounded-full",
              isEnabled && isInstalled ? "bg-primary" : "bg-muted-foreground/30"
            )}
          />
        </div>

        {/* Enable/Disable Toggle */}
        {isInstalled && !isUninstalling ? (
          <div className="mt-2 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
            <span className="text-sm text-muted-foreground">Enabled</span>
            <Switch
              checked={isEnabled}
              onCheckedChange={() => activeProfileId && toggleMod(activeProfileId, mod.id)}
            />
          </div>
        ) : null}

        {/* Download/Uninstall Button */}
        <Button
          variant={isInstalled ? "destructive" : "default"}
          size="sm"
          className="mt-2 w-full"
          onClick={handleActionClick}
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
      </div>

      {/* Status Badge */}
      {isInstalled && isEnabled && !hasWarnings && !hasUpdate ? (
        <div className="absolute right-2 top-2 rounded bg-primary/90 px-2 py-0.5 text-xs font-medium text-primary-foreground">
          Active
        </div>
      ) : null}

      {/* Update Available Badge */}
      {hasUpdate && !hasWarnings ? (
        <div className="absolute right-2 top-2 rounded bg-green-200 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-500">
          Update available
        </div>
      ) : null}

      {/* Warning Badge for Missing Dependencies */}
      {hasWarnings ? (
        <div className="absolute right-2 top-2 rounded bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-600 dark:text-yellow-500 flex items-center gap-1">
          <AlertTriangle className="size-3" />
          Missing deps
        </div>
      ) : null}

      {/* Download Status Badges */}
      {isQueued && !hasWarnings && !hasUpdate ? (
        <div className="absolute right-2 top-2 rounded bg-muted px-2 py-0.5 text-xs font-medium">
          Queued
        </div>
      ) : null}
      {isPaused && !hasWarnings && !hasUpdate ? (
        <div className="absolute right-2 top-2 rounded bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-600 dark:text-yellow-500">
          Paused
        </div>
      ) : null}
      {isDownloading && downloadTask && !hasWarnings && !hasUpdate ? (
        <div className="absolute right-2 top-2 rounded bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-500">
          {downloadTask.progress.toFixed(0)}%
        </div>
      ) : null}
    </div>
    </>
  )
})
