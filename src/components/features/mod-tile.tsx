import type { Mod } from "@/mocks/mods"

import { memo } from "react"
import { useTranslation } from "react-i18next"
import { Download, Trash2, Loader2, Pause, AlertTriangle } from "lucide-react"
import { useAppStore } from "@/store/app-store"
import { useDownloadStore } from "@/store/download-store"
import { useActiveProfileId, useInstalledMods, useToggleMod } from "@/data"
import { useDownloadActions } from "@/hooks/use-download-actions"
import { useModActions } from "@/hooks/use-mod-actions"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { isVersionGreater } from "@/lib/version-utils"

type ModTileProps = {
  mod: Mod
  onOpenDependencyDialog?: (mod: Mod, version: string) => void
}

export const ModTile = memo(function ModTile({ mod, onOpenDependencyDialog }: ModTileProps) {
  const { t } = useTranslation()
  const selectMod = useAppStore((s) => s.selectMod)
  const selectedModId = useAppStore((s) => s.selectedModId)
  const selectedGameId = useAppStore((s) => s.selectedGameId)
  
  const toggleMod = useToggleMod()
  const { uninstallMod } = useModActions()
  const activeProfileId = useActiveProfileId(selectedGameId)
  const { isModInstalled, isModEnabled, getInstalledVersion, getDependencyWarnings } = useInstalledMods(activeProfileId)
  
  const { startDownload } = useDownloadActions()

  const isSelected = selectedModId === mod.id
  
  // Subscribe to download task
  const downloadTask = useDownloadStore((s) => s.tasks[mod.id])

  const isInstalled = isModInstalled(mod.id)
  const isEnabled = isModEnabled(mod.id)
  const isUninstalling = false
  
  // Check for dependency warnings
  const depWarnings = getDependencyWarnings(mod.id)
  const hasWarnings = isInstalled && depWarnings.length > 0
  
  // Check download states
  const isDownloading = downloadTask?.status === "downloading"
  const isQueued = downloadTask?.status === "queued"
  const isPaused = downloadTask?.status === "paused"
  const hasDownloadTask = isDownloading || isQueued || isPaused

  const installedVersion = getInstalledVersion(mod.id)
  const hasUpdate = isInstalled && installedVersion && isVersionGreater(mod.version, installedVersion)

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!activeProfileId) return
    
    if (isInstalled) {
      uninstallMod(activeProfileId, mod.id, { author: mod.author, name: mod.name })
    } else {
      // Keep tiles cheap: only do dependency resolution inside the dependency dialog.
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
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-md border bg-card text-left transition-colors cursor-pointer h-[340px]",
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
        <p className="text-xs text-muted-foreground">{t("library_by_author", { author: mod.author })}</p>
        
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
            {t("library_downloads_count", { count: mod.downloads })}
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
            <span className="text-sm text-muted-foreground">{t("common_enabled")}</span>
            <Switch
              checked={isEnabled}
              onCheckedChange={() => activeProfileId && toggleMod.mutate({ profileId: activeProfileId, modId: mod.id })}
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
                  {t("common_uninstalling")}
                </>
              ) : (
                <>
                  <Trash2 className="size-3 mr-1.5" />
                  {t("common_uninstall")}
                </>
              )}
            </>
          ) : hasDownloadTask ? (
            <>
              {isDownloading && <Loader2 className="size-3 mr-1.5 animate-spin" />}
              {isPaused && <Pause className="size-3 mr-1.5" />}
              {isQueued ? t("downloads_status_queued") : isPaused ? t("downloads_status_paused") : t("downloads_status_downloading")}
            </>
          ) : (
            <>
              <Download className="size-3 mr-1.5" />
              {t("common_download")}
            </>
          )}
        </Button>
      </div>

      {/* Status Badge */}
      {isInstalled && isEnabled && !hasWarnings && !hasUpdate ? (
        <div className="absolute right-2 top-2 rounded bg-primary/90 px-2 py-0.5 text-xs font-medium text-primary-foreground">
          {t("common_active")}
        </div>
      ) : null}

      {/* Update Available Badge */}
      {hasUpdate && !hasWarnings ? (
        <div className="absolute right-2 top-2 rounded bg-green-200 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-500">
          {t("mod_inspector_update_available")}
        </div>
      ) : null}

      {/* Warning Badge for Missing Dependencies */}
      {hasWarnings ? (
        <div className="absolute right-2 top-2 rounded bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-600 dark:text-yellow-500 flex items-center gap-1">
          <AlertTriangle className="size-3" />
          {t("common_missing_deps")}
        </div>
      ) : null}

      {/* Download Status Badges */}
      {isQueued && !hasWarnings && !hasUpdate ? (
        <div className="absolute right-2 top-2 rounded bg-muted px-2 py-0.5 text-xs font-medium">
          {t("downloads_status_queued")}
        </div>
      ) : null}
      {isPaused && !hasWarnings && !hasUpdate ? (
        <div className="absolute right-2 top-2 rounded bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-600 dark:text-yellow-500">
          {t("downloads_status_paused")}
        </div>
      ) : null}
      {isDownloading && downloadTask && !hasWarnings && !hasUpdate ? (
        <div className="absolute right-2 top-2 rounded bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-500">
          {downloadTask.progress.toFixed(0)}%
        </div>
      ) : null}
    </div>
  )
})
