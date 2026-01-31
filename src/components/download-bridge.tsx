/**
 * DownloadBridge - Single IPC subscription point for download events
 * 
 * This component solves the N-duplicate-subscriptions problem by:
 * 1. Mounting exactly once in the app bootstrap
 * 2. Being the ONLY place that subscribes to window.electron IPC events
 * 3. Updating Zustand store when events arrive (store notifies all components)
 * 4. Syncing settings to main process when they change
 * 
 * Before: Each component calling useDownloadActions() created a subscription → N subscriptions
 * After: One bridge component → 1 subscription → massive perf improvement
 */
import { useEffect, useRef } from "react"
import { useDownloadStore } from "@/store/download-store"
import { useSettingsStore } from "@/store/settings-store"
import { trpc } from "@/lib/trpc"

type DownloadUpdateEvent = {
  downloadId: string
  status: "queued" | "downloading" | "paused" | "completed" | "error" | "cancelled"
  bytesDownloaded?: number
  bytesTotal?: number
  speedBps?: number
  error?: string
}

type DownloadProgressEvent = {
  downloadId: string
  bytesDownloaded: number
  bytesTotal: number
  speedBps: number
}

export function DownloadBridge() {
  const updateTask = useDownloadStore((s) => s._updateTask)
  
  // Get individual settings for syncing to main process
  const maxConcurrent = useSettingsStore((s) => s.global.maxConcurrentDownloads)
  const speedLimitEnabled = useSettingsStore((s) => s.global.speedLimitEnabled)
  const speedLimitBps = useSettingsStore((s) => s.global.speedLimitBps)
  
  // Get path settings for syncing to main process
  const dataFolder = useSettingsStore((s) => s.global.dataFolder)
  const modDownloadFolder = useSettingsStore((s) => s.global.modDownloadFolder)
  const cacheFolder = useSettingsStore((s) => s.global.cacheFolder)
  const perGame = useSettingsStore((s) => s.perGame)
  
  const updateSettingsMutation = trpc.downloads.updateSettings.useMutation()
  
  // Sync settings to main process when they change
  useEffect(() => {
    // Filter perGame to only include path-related settings
    const perGamePaths: Record<string, { modDownloadFolder: string; cacheFolder: string; modCacheFolder: string }> = {}
    for (const [gameId, settings] of Object.entries(perGame)) {
      perGamePaths[gameId] = {
        modDownloadFolder: settings.modDownloadFolder || "",
        cacheFolder: settings.cacheFolder || "",
        modCacheFolder: settings.modCacheFolder || "",
      }
    }
    
    updateSettingsMutation.mutate({
      maxConcurrent,
      speedLimitBps: speedLimitEnabled ? speedLimitBps : 0,
      pathSettings: {
        global: {
          dataFolder,
          modDownloadFolder: modDownloadFolder || "",
          cacheFolder: cacheFolder || "",
        },
        perGame: perGamePaths,
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxConcurrent, speedLimitEnabled, speedLimitBps, dataFolder, modDownloadFolder, cacheFolder, perGame])
  
  // Single IPC subscription (with StrictMode guard to prevent double-subscription)
  const subscriptionActiveRef = useRef(false)
  
  useEffect(() => {
    // Guard against StrictMode double-mounting
    if (subscriptionActiveRef.current) return
    if (!window.electron) return
    
    subscriptionActiveRef.current = true
    
    // Handler for download status updates (queued → downloading → paused → completed/error)
    const handleDownloadUpdated = (data: unknown) => {
      const event = data as DownloadUpdateEvent
      const progress = event.bytesTotal && event.bytesTotal > 0
        ? Math.min(100, Math.round((event.bytesDownloaded ?? 0) / event.bytesTotal * 100))
        : undefined
      updateTask(event.downloadId, {
        status: event.status,
        error: event.error,
        bytesDownloaded: event.bytesDownloaded,
        bytesTotal: event.bytesTotal,
        speedBps: event.speedBps,
        ...(progress !== undefined ? { progress } : {}),
      })
    }

    // Handler for download progress (bytes, speed)
    const handleDownloadProgress = (data: unknown) => {
      const event = data as DownloadProgressEvent
      const progress = event.bytesTotal > 0 ? Math.min(100, Math.round((event.bytesDownloaded / event.bytesTotal) * 100)) : 0
      updateTask(event.downloadId, {
        bytesDownloaded: event.bytesDownloaded,
        bytesTotal: event.bytesTotal,
        speedBps: event.speedBps,
        progress,
      })
    }
    
    // Handler for download completion
    const handleDownloadCompleted = (data: unknown) => {
      const event = data as { downloadId: string; result?: { bytesTotal?: number } }
      updateTask(event.downloadId, {
        status: "completed",
        progress: 100,
        bytesDownloaded: event.result?.bytesTotal ?? undefined,
        bytesTotal: event.result?.bytesTotal ?? undefined,
        speedBps: 0,
      })
    }
    
    // Handler for download failure
    const handleDownloadFailed = (data: unknown) => {
      const event = data as { downloadId: string; error: string }
      updateTask(event.downloadId, {
        status: "error",
        error: event.error,
        speedBps: 0,
      })
    }
    
    // Subscribe to all IPC events
    const unsubUpdated = window.electron.onDownloadUpdated(handleDownloadUpdated)
    const unsubProgress = window.electron.onDownloadProgress(handleDownloadProgress)
    const unsubCompleted = window.electron.onDownloadCompleted(handleDownloadCompleted)
    const unsubFailed = window.electron.onDownloadFailed(handleDownloadFailed)
    
    // Cleanup: unsubscribe all
    return () => {
      subscriptionActiveRef.current = false
      unsubUpdated()
      unsubProgress()
      unsubCompleted()
      unsubFailed()
    }
  }, [updateTask])
  
  // This is an invisible bridge component
  return null
}
