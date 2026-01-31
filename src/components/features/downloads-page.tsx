import { Settings, Pause, Play, X, CheckCircle2, AlertCircle, Clock, Loader2, FolderOpen, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useDownloadStore, type DownloadTask } from "@/store/download-store"
import { useDownloadActions } from "@/hooks/use-download-actions"
import { useModInstaller } from "@/hooks/use-mod-installer"
import { useModManagementStore } from "@/store/mod-management-store"
import { useProfileStore } from "@/store/profile-store"
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

function getStatusLabel(status: DownloadTask["status"]): string {
  switch (status) {
    case "queued":
      return "Queued"
    case "downloading":
      return "Downloading"
    case "completed":
      return "Completed"
    case "error":
      return "Failed"
    case "paused":
      return "Paused"
    case "cancelled":
      return "Cancelled"
  }
}

export function DownloadsPage() {
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
  const activeProfileIdByGame = useProfileStore((s) => s.activeProfileIdByGame)
  const isModInstalled = useModManagementStore((s) => s.isModInstalled)
  
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
              <h1 className="text-2xl font-bold text-balance">Downloads</h1>
              <p className="text-sm text-muted-foreground text-pretty">
                Manage your mod downloads and installation queue
              </p>
            </div>
            <div className="flex items-center gap-6">
              {/* Stats */}
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Download</div>
                  <div className="text-sm font-medium tabular-nums">{formatSpeed(totalSpeed)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Upload</div>
                  <div className="text-sm font-medium tabular-nums">0 B/s</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Active</div>
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
              Upcoming <span className="text-muted-foreground">({queuedCount})</span>
            </h2>
            <p className="text-sm text-muted-foreground">
              {queuedCount === 0 ? "No downloads in the queue" : `${activeDownloads} active, ${queuedCount - activeDownloads} pending`}
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
                    Resume All
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={pauseAll}
                    disabled={activeDownloads === 0}
                  >
                    <Pause className="size-4 mr-1.5" />
                    Pause All
                  </Button>
                )}
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={cancelAll}
                >
                  <X className="size-4 mr-1.5" />
                  Cancel All
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Downloads List - Grouped by Game */}
        <div className="space-y-6">
          {allTasks.length === 0 ? (
            <div className="rounded-lg border border-border bg-muted/50 p-12 text-center">
              <p className="text-sm text-muted-foreground">No downloads in your queue</p>
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
                        {gameTasks.length} {gameTasks.length === 1 ? "download" : "downloads"}
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
                                  <span>{getStatusLabel(task.status)}</span>
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
                                  Downloaded {formatBytes(task.bytesTotal)} successfully
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  {/* Install button */}
                                  {task.extractedPath && (() => {
                                    const profileId = activeProfileIdByGame[task.gameId]
                                    const alreadyInstalled = profileId && isModInstalled(profileId, task.modId)
                                    
                                    if (!alreadyInstalled && profileId) {
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
                                          Install to Profile
                                        </Button>
                                      )
                                    }
                                    return null
                                  })()}
                                  
                                  {/* Show folder buttons */}
                                  {task.archivePath && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openFolder(getDirectoryPath(task.archivePath!))}
                                      className="h-7 text-xs"
                                    >
                                      <FolderOpen className="size-3 mr-1.5" />
                                      Show Archive
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
                                      Show Extracted
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Error info */}
                            {task.status === "error" && (
                              <div className="text-xs text-destructive">
                                {task.error || "Download failed"}
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
