import { useTranslation } from "react-i18next"
import { Settings, Pause, Play, X, CheckCircle2, AlertCircle, Clock, Loader2, FolderOpen, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { useDownloadStore, type DownloadTask } from "@/store/download-store"
import { useDownloadActions } from "@/hooks/use-download-actions"
import { useModInstaller } from "@/hooks/use-mod-installer"
import { getClient } from "@/data"
import { ECOSYSTEM_GAMES } from "@/lib/ecosystem-games"
import { openFolder } from "@/lib/desktop"

function getDirectoryPath(filePath: string): string {
  // Get the directory containing the file (works on both Windows and Unix paths)
  const lastSlash = Math.max(filePath.lastIndexOf("/"), filePath.lastIndexOf("\\"))
  return lastSlash > 0 ? filePath.substring(0, lastSlash) : filePath
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

function formatSpeed(bps: number): string {
  return `${formatBytes(bps)}/s`
}

function getStatusBadgeVariant(status: DownloadTask["status"]): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "downloading":
      return "default"
    case "completed":
      return "secondary"
    case "error":
      return "destructive"
    default:
      return "outline"
  }
}

function getStatusIcon(status: DownloadTask["status"]) {
  switch (status) {
    case "downloading":
      return <Loader2 className="size-3 animate-spin" />
    case "completed":
      return <CheckCircle2 className="size-3" />
    case "error":
      return <AlertCircle className="size-3" />
    case "queued":
      return <Clock className="size-3" />
    default:
      return null
  }
}

const DOWNLOAD_STATUS_KEYS: Record<DownloadTask["status"], string> = {
  queued: "downloads_status_queued",
  downloading: "downloads_status_downloading",
  completed: "downloads_status_completed",
  error: "downloads_status_failed",
  paused: "downloads_status_paused",
  cancelled: "downloads_status_cancelled",
}

/** Install button that async-checks profile/mod status via tRPC client */
function DownloadInstallButton({
  task,
  installDownloadedMod,
  isInstalling,
}: {
  task: DownloadTask
  installDownloadedMod: (params: {
    gameId: string
    profileId: string
    modId: string
    author: string
    name: string
    version: string
    extractedPath: string
  }) => void
  isInstalling: boolean
}) {
  const { t } = useTranslation()
  const [profileId, setProfileId] = useState<string | null>(null)
  const [alreadyInstalled, setAlreadyInstalled] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    let cancelled = false
    const check = async () => {
      try {
        const client = getClient()
        const profile = await client.data.profiles.getActive.query({ gameId: task.gameId })
        if (cancelled) return
        if (!profile) {
          setChecked(true)
          return
        }
        setProfileId(profile.id)
        const mods = await client.data.mods.listInstalled.query({ profileId: profile.id })
        if (cancelled) return
        setAlreadyInstalled(mods.some(m => m.modId === task.modId))
        setChecked(true)
      } catch {
        if (!cancelled) setChecked(true)
      }
    }
    check()
    return () => { cancelled = true }
  }, [task.gameId, task.modId])

  if (!checked || !profileId || alreadyInstalled) return null

  return (
    <Button
      variant="default"
      size="sm"
      onClick={() => {
        installDownloadedMod({
          gameId: task.gameId,
          profileId,
          modId: task.modId,
          author: task.modAuthor,
          name: task.modName,
          version: task.modVersion,
          extractedPath: task.extractedPath!,
        })
      }}
      disabled={isInstalling}
      className="h-7 text-xs"
    >
      <Download className="size-3 mr-1.5" />
      {t("downloads_install_to_profile")}
    </Button>
  )
}

export function DownloadsPage() {
  const { t } = useTranslation()
  const tasks = useDownloadStore((s) => s.tasks)
  const getAllActiveTasks = useDownloadStore((s) => s.getAllActiveTasks)
  const getPausedTasks = useDownloadStore((s) => s.getPausedTasks)
  
  const {
    pauseDownload,
    resumeDownload,
    cancelDownload,
    pauseAll,
    resumeAll,
    cancelAll,
  } = useDownloadActions()
  
  const { installDownloadedMod, isInstalling } = useModInstaller()
  
  const allTasks = Object.values(tasks)
  const activeTasks = getAllActiveTasks()
  const pausedTasks = getPausedTasks()
  
  // Group tasks by game
  const tasksByGame = allTasks.reduce((acc, task) => {
    if (!acc[task.gameId]) {
      acc[task.gameId] = []
    }
    acc[task.gameId].push(task)
    return acc
  }, {} as Record<string, DownloadTask[]>)
  
  const activeDownloads = allTasks.filter(
    (d) => d.status === "downloading"
  ).length
  
  const totalSpeed = allTasks
    .filter((d) => d.status === "downloading")
    .reduce((sum, task) => sum + task.speedBps, 0)

  const queuedCount = activeTasks.length

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-7xl px-6 py-6">
        {/* Header Band */}
        <div className="mb-6 rounded-xl border border-border bg-gradient-to-br from-sky-900/20 via-slate-900/30 to-slate-950/40 p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-balance">{t("downloads_page_title")}</h1>
              <p className="text-sm text-muted-foreground text-pretty">
                {t("downloads_page_description")}
              </p>
            </div>
            <div className="flex items-center gap-6">
              {/* Stats */}
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">{t("downloads_label_download")}</div>
                  <div className="text-sm font-medium tabular-nums">{formatSpeed(totalSpeed)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">{t("downloads_label_upload")}</div>
                  <div className="text-sm font-medium tabular-nums">0 B/s</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">{t("downloads_label_active")}</div>
                  <div className="text-sm font-medium tabular-nums">{activeDownloads}</div>
                </div>
              </div>
              {/* Settings Button */}
              <Button variant="ghost" size="icon">
                <Settings className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {t("downloads_section_upcoming")} <span className="text-muted-foreground">({queuedCount})</span>
            </h2>
            <p className="text-sm text-muted-foreground">
              {queuedCount === 0 ? t("downloads_queue_empty") : t("downloads_queue_status", { active: activeDownloads, pending: queuedCount - activeDownloads })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {queuedCount > 0 && (
              <>
                {pausedTasks.length > 0 ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={resumeAll}
                  >
                    <Play className="size-4 mr-1.5" />
                    {t("downloads_resume_all")}
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={pauseAll}
                    disabled={activeDownloads === 0}
                  >
                    <Pause className="size-4 mr-1.5" />
                    {t("downloads_pause_all")}
                  </Button>
                )}
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={cancelAll}
                >
                  <X className="size-4 mr-1.5" />
                  {t("downloads_cancel_all")}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Downloads List - Grouped by Game */}
        <div className="space-y-6">
          {allTasks.length === 0 ? (
            <div className="rounded-lg border border-border bg-muted/50 p-12 text-center">
              <p className="text-sm text-muted-foreground">{t("downloads_no_downloads_in_queue")}</p>
            </div>
          ) : (
            Object.entries(tasksByGame).map(([gameId, gameTasks]) => {
              const game = ECOSYSTEM_GAMES.find((g) => g.id === gameId)
              if (!game) return null
              
              return (
                <div key={gameId}>
                  {/* Game Header */}
                  <div className="mb-3 flex items-center gap-3">
                    <img
                      src={game.bannerUrl}
                      alt={game.name}
                      className="size-8 rounded object-cover"
                    />
                    <div>
                      <h3 className="text-sm font-semibold">{game.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {gameTasks.length === 1 ? t("downloads_count", { count: gameTasks.length }) : t("downloads_count_plural", { count: gameTasks.length })}
                      </p>
                    </div>
                  </div>
                  
                  {/* Game Downloads */}
                  <div className="space-y-2">
                    {gameTasks.map((task) => (
                      <div
                        key={task.modId}
                        className={cn(
                          "rounded-lg border border-border bg-card p-4",
                          task.status === "completed" && "opacity-60"
                        )}
                      >
                        <div className="flex items-start gap-4">
                          {/* Mod Image */}
                          <img
                            src={task.modIconUrl}
                            alt={task.modName}
                            className="size-12 shrink-0 rounded object-cover"
                          />

                          {/* Content */}
                          <div className="flex-1 space-y-2">
                            {/* Top row: name, version, status */}
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="text-sm font-semibold text-balance">{task.modName}</h3>
                                <p className="text-xs text-muted-foreground">
                                  by {task.modAuthor} · v{task.modVersion}
                                </p>
                              </div>
                              <Badge variant={getStatusBadgeVariant(task.status)} className="shrink-0">
                                <span className="flex items-center gap-1">
                                  {getStatusIcon(task.status)}
                                  <span>{t(DOWNLOAD_STATUS_KEYS[task.status])}</span>
                                </span>
                              </Badge>
                            </div>

                            {/* Progress bar (if active) */}
                            {(task.status === "downloading" || task.status === "paused") && (
                              <div className="space-y-1">
                                <Progress value={task.progress} max={100} />
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span className="tabular-nums">
                                    {formatBytes(task.bytesDownloaded)} / {formatBytes(task.bytesTotal)} ({task.progress}%)
                                  </span>
                                  {task.status === "downloading" && (
                                    <span className="tabular-nums">
                                      {formatSpeed(task.speedBps)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Completed info */}
                            {task.status === "completed" && (
                              <div className="space-y-2">
                                <div className="text-xs text-muted-foreground">
                                  {t("downloads_downloaded_success", { size: formatBytes(task.bytesTotal) })}
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  {/* Install button */}
                                  {task.extractedPath && (
                                    <DownloadInstallButton
                                      task={task}
                                      installDownloadedMod={installDownloadedMod}
                                      isInstalling={isInstalling}
                                    />
                                  )}
                                  
                                  {/* Show folder buttons */}
                                  {task.archivePath && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openFolder(getDirectoryPath(task.archivePath!))}
                                      className="h-7 text-xs"
                                    >
                                      <FolderOpen className="size-3 mr-1.5" />
                                      {t("downloads_show_archive")}
                                    </Button>
                                  )}
                                  {task.extractedPath && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openFolder(task.extractedPath!)}
                                      className="h-7 text-xs"
                                    >
                                      <FolderOpen className="size-3 mr-1.5" />
                                      {t("downloads_show_extracted")}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Error info */}
                            {task.status === "error" && (
                              <div className="text-xs text-destructive">
                                {task.error || t("downloads_failed")}
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex shrink-0 items-center gap-1">
                            {task.status === "downloading" && (
                              <Button variant="ghost" size="icon" onClick={() => pauseDownload(task.downloadId)}>
                                <Pause className="size-4" />
                              </Button>
                            )}
                            {task.status === "paused" && (
                              <Button variant="ghost" size="icon" onClick={() => resumeDownload(task.downloadId)}>
                                <Play className="size-4" />
                              </Button>
                            )}
                            {task.status === "error" && (
                              <>
                                <Button variant="ghost" size="icon" onClick={() => cancelDownload(task.downloadId)}>
                                  <X className="size-4" />
                                </Button>
                              </>
                            )}
                            {(task.status === "queued" || task.status === "downloading" || task.status === "paused") && (
                              <Button variant="ghost" size="icon" onClick={() => cancelDownload(task.downloadId)}>
                                <X className="size-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
