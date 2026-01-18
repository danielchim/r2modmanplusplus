import { Settings, Pause, Play, X, CheckCircle2, AlertCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

type DownloadStatus = "queued" | "downloading" | "verifying" | "installing" | "completed" | "failed" | "paused"

type DownloadItem = {
  id: string
  name: string
  version: string
  author: string
  status: DownloadStatus
  progress: number
  speed: string
  eta: string
  size: string
  downloaded: string
}

const FAKE_DOWNLOADS: DownloadItem[] = [
  {
    id: "1",
    name: "BepInExPack",
    version: "5.4.2100",
    author: "bbepis",
    status: "downloading",
    progress: 67,
    speed: "8.2 MB/s",
    eta: "12s",
    size: "45.2 MB",
    downloaded: "30.3 MB",
  },
  {
    id: "2",
    name: "R2API",
    version: "5.1.7",
    author: "RiskofThunder",
    status: "downloading",
    progress: 34,
    speed: "6.8 MB/s",
    eta: "28s",
    size: "78.5 MB",
    downloaded: "26.7 MB",
  },
  {
    id: "3",
    name: "HookGenPatcher",
    version: "1.2.5",
    author: "RiskofThunder",
    status: "queued",
    progress: 0,
    speed: "—",
    eta: "—",
    size: "12.4 MB",
    downloaded: "0 B",
  },
  {
    id: "4",
    name: "MoreCompany",
    version: "1.8.1",
    author: "notnotnotswipez",
    status: "verifying",
    progress: 100,
    speed: "—",
    eta: "—",
    size: "23.7 MB",
    downloaded: "23.7 MB",
  },
  {
    id: "5",
    name: "BetterStamina",
    version: "2.3.0",
    author: "XoXFaby",
    status: "completed",
    progress: 100,
    speed: "—",
    eta: "—",
    size: "8.9 MB",
    downloaded: "8.9 MB",
  },
  {
    id: "6",
    name: "TooManyFriends",
    version: "1.0.4",
    author: "tristanmcpherson",
    status: "paused",
    progress: 45,
    speed: "—",
    eta: "—",
    size: "15.3 MB",
    downloaded: "6.9 MB",
  },
]

function getStatusBadgeVariant(status: DownloadStatus): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "downloading":
    case "verifying":
    case "installing":
      return "default"
    case "completed":
      return "secondary"
    case "failed":
      return "destructive"
    default:
      return "outline"
  }
}

function getStatusIcon(status: DownloadStatus) {
  switch (status) {
    case "downloading":
      return <Clock className="size-3" />
    case "completed":
      return <CheckCircle2 className="size-3" />
    case "failed":
      return <AlertCircle className="size-3" />
    default:
      return null
  }
}

function getStatusLabel(status: DownloadStatus): string {
  switch (status) {
    case "queued":
      return "Queued"
    case "downloading":
      return "Downloading"
    case "verifying":
      return "Verifying"
    case "installing":
      return "Installing"
    case "completed":
      return "Completed"
    case "failed":
      return "Failed"
    case "paused":
      return "Paused"
  }
}

export function DownloadsPage() {
  const activeDownloads = FAKE_DOWNLOADS.filter(
    (d) => d.status === "downloading" || d.status === "verifying" || d.status === "installing"
  ).length

  const queuedCount = FAKE_DOWNLOADS.filter(
    (d) => d.status === "queued" || d.status === "downloading" || d.status === "verifying" || d.status === "installing" || d.status === "paused"
  ).length

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
                  <div className="text-sm font-medium tabular-nums">14.2 MB/s</div>
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
          <div className="text-sm text-muted-foreground">
            {activeDownloads === 0 ? "All caught up" : "Auto-updates enabled"}
          </div>
        </div>

        {/* Downloads List */}
        <div className="space-y-2">
          {FAKE_DOWNLOADS.length === 0 ? (
            <div className="rounded-lg border border-border bg-muted/50 p-12 text-center">
              <p className="text-sm text-muted-foreground">No downloads in your queue</p>
            </div>
          ) : (
            FAKE_DOWNLOADS.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "rounded-lg border border-border bg-card p-4",
                  item.status === "completed" && "opacity-60"
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Icon placeholder */}
                  <div className="flex size-12 shrink-0 items-center justify-center rounded bg-muted text-xs font-bold text-muted-foreground">
                    {item.name.substring(0, 2).toUpperCase()}
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-2">
                    {/* Top row: name, version, status */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-balance">{item.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          by {item.author} · v{item.version}
                        </p>
                      </div>
                      <Badge variant={getStatusBadgeVariant(item.status)} className="shrink-0">
                        <span className="flex items-center gap-1">
                          {getStatusIcon(item.status)}
                          <span>{getStatusLabel(item.status)}</span>
                        </span>
                      </Badge>
                    </div>

                    {/* Progress bar (if active) */}
                    {(item.status === "downloading" || item.status === "verifying" || item.status === "installing" || item.status === "paused") && (
                      <div className="space-y-1">
                        <Progress value={item.progress} max={100} />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="tabular-nums">
                            {item.downloaded} / {item.size} ({item.progress}%)
                          </span>
                          {item.status === "downloading" && (
                            <span className="tabular-nums">
                              {item.speed} · {item.eta} remaining
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Completed info */}
                    {item.status === "completed" && (
                      <div className="text-xs text-muted-foreground">
                        Downloaded {item.size} successfully
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-1">
                    {item.status === "downloading" && (
                      <Button variant="ghost" size="icon">
                        <Pause className="size-4" />
                      </Button>
                    )}
                    {item.status === "paused" && (
                      <Button variant="ghost" size="icon">
                        <Play className="size-4" />
                      </Button>
                    )}
                    {(item.status === "queued" || item.status === "downloading" || item.status === "paused") && (
                      <Button variant="ghost" size="icon">
                        <X className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
