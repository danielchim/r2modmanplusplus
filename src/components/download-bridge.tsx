/**
 * DownloadBridge - Single IPC subscription point for download events
 *
 * This component solves the N-duplicate-subscriptions problem by:
 * 1. Mounting exactly once in the app bootstrap
 * 2. Being the ONLY place that subscribes to window.electron IPC events
 * 3. Updating Zustand store when events arrive (store notifies all components)
 * 4. Syncing settings to main process when they change
 */
import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { useDownloadStore } from "@/store/download-store"
import { useAllSettings, getClient, queryKeys } from "@/data"
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
  const qc = useQueryClient()

  // Reactive settings via data hooks (for syncing to main process)
  const { global: globalSettings, perGame } = useAllSettings()
  const { maxConcurrentDownloads: maxConcurrent, speedLimitEnabled, speedLimitBps, dataFolder, modDownloadFolder, cacheFolder } = globalSettings

  const updateSettingsMutation = trpc.downloads.updateSettings.useMutation()
  const installModMutation = trpc.profiles.installMod.useMutation()

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
    const handleDownloadCompleted = async (data: unknown) => {
      const event = data as {
        downloadId: string
        result?: {
          bytesTotal?: number
          archivePath?: string
          extractedPath?: string
        }
      }
      updateTask(event.downloadId, {
        status: "completed",
        progress: 100,
        bytesDownloaded: event.result?.bytesTotal ?? undefined,
        bytesTotal: event.result?.bytesTotal ?? undefined,
        speedBps: 0,
        archivePath: event.result?.archivePath,
        extractedPath: event.result?.extractedPath,
      })

      // Get task info for toast and auto-install
      const task = useDownloadStore.getState().getTask(event.downloadId)
      if (!task) return

      const client = getClient()

      // Check if auto-install is enabled
      try {
        const globalSettings = await client.data.settings.getGlobal.query()
        const autoInstallEnabled = globalSettings.autoInstallMods

        if (autoInstallEnabled && event.result?.extractedPath) {
          // Get active profile for this game
          const activeProfile = await client.data.profiles.getActive.query({ gameId: task.gameId })
          const activeProfileId = activeProfile?.id ?? null

          if (activeProfileId) {
            // Check if mod is already installed
            const installedMods = await client.data.mods.listInstalled.query({ profileId: activeProfileId })
            const isAlreadyInstalled = installedMods.some(m => m.modId === task.modId)

            if (!isAlreadyInstalled) {
              try {
                // Auto-install the mod
                const result = await installModMutation.mutateAsync({
                  gameId: task.gameId,
                  profileId: activeProfileId,
                  modId: task.modId,
                  author: task.modAuthor,
                  name: task.modName,
                  version: task.modVersion,
                  extractedPath: event.result.extractedPath,
                })

                // Mark as installed in DB
                await client.data.mods.install.mutate({
                  profileId: activeProfileId,
                  modId: task.modId,
                  version: task.modVersion,
                })
                // Invalidate cache
                qc.invalidateQueries({ queryKey: queryKeys.mods.root })

                toast.success(`${task.modName} installed`, {
                  description: `v${task.modVersion} - ${result.filesCopied} files copied to profile`,
                })
              } catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error"
                toast.error(`Auto-install failed: ${task.modName}`, {
                  description: message,
                })
              }
            } else {
              toast.success(`${task.modName} downloaded`, {
                description: `v${task.modVersion} - already installed`,
              })
            }
          } else {
            toast.success(`${task.modName} downloaded`, {
              description: `v${task.modVersion} - no active profile`,
            })
          }
        } else {
          toast.success(`${task.modName} downloaded`, {
            description: `v${task.modVersion} is ready to install`,
          })
        }
      } catch {
        // If settings fetch fails, just show download success
        toast.success(`${task.modName} downloaded`, {
          description: `v${task.modVersion} is ready to install`,
        })
      }
    }

    // Handler for download failure
    const handleDownloadFailed = (data: unknown) => {
      const event = data as { downloadId: string; error: string }
      updateTask(event.downloadId, {
        status: "error",
        error: event.error,
        speedBps: 0,
      })

      // Show error toast
      const task = useDownloadStore.getState().getTask(event.downloadId)
      if (task) {
        toast.error(`Download failed: ${task.modName}`, {
          description: event.error,
        })
      }
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
  }, [updateTask, qc])

  // This is an invisible bridge component
  return null
}
