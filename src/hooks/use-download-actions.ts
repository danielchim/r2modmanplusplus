/**
 * Download actions hook - provides event handlers for download operations
 * No effects here - just actions derived from current state at the moment of user interaction
 */
import { useCallback } from "react"
import { toast } from "sonner"
import { trpc } from "@/lib/trpc"
import { useDownloadStore } from "@/store/download-store"
import { useGlobalSettings } from "@/data"

export function useDownloadActions() {
  const enqueueMutation = trpc.downloads.enqueue.useMutation()
  const cancelMutation = trpc.downloads.cancel.useMutation()
  const pauseMutation = trpc.downloads.pause.useMutation()
  const resumeMutation = trpc.downloads.resume.useMutation()
  
  const globalSettings = useGlobalSettings()

  const startDownload = useCallback(
    (params: {
      gameId: string
      modId: string
      modName: string
      modVersion: string
      modAuthor: string
      modIconUrl: string
      downloadUrl: string
    }) => {
      const downloadId = `${params.gameId}:${params.modId}:${params.modVersion}`

      const preferredCdn = globalSettings.preferredThunderstoreCdn
      const downloadCacheEnabled = globalSettings.downloadCacheEnabled
      
      // Optimistically add task to store
      useDownloadStore.getState()._addTask({
        downloadId,
        modId: params.modId,
        gameId: params.gameId,
        modName: params.modName,
        modVersion: params.modVersion,
        modAuthor: params.modAuthor,
        modIconUrl: params.modIconUrl,
        status: "queued",
        progress: 0,
        bytesDownloaded: 0,
        bytesTotal: 0,
        speedBps: 0,
      })
      
      // Show toast notification
      toast.info(`Downloading ${params.modName}`, {
        description: `v${params.modVersion} added to download queue`,
      })
      
      // Enqueue in main process
      enqueueMutation.mutate({
        gameId: params.gameId,
        modId: params.modId,
        author: params.modAuthor,
        name: params.modName,
        version: params.modVersion,
        downloadUrl: params.downloadUrl,
        preferredCdn,
        ignoreCache: !downloadCacheEnabled,
      })
    },
    [enqueueMutation, globalSettings]
  )
  
  const pauseDownload = useCallback(
    (downloadId: string) => {
      pauseMutation.mutate({ downloadId })
    },
    [pauseMutation]
  )
  
  const resumeDownload = useCallback(
    (downloadId: string) => {
      resumeMutation.mutate({ downloadId })
    },
    [resumeMutation]
  )
  
  const cancelDownload = useCallback(
    (downloadId: string) => {
      cancelMutation.mutate({ downloadId })
      useDownloadStore.getState()._removeTask(downloadId)
    },
    [cancelMutation]
  )
  
  const pauseAll = useCallback(() => {
    const tasks = useDownloadStore.getState().tasks
    Object.values(tasks).forEach((task) => {
      if (task.status === "downloading" || task.status === "queued") {
        pauseMutation.mutate({ downloadId: task.downloadId })
      }
    })
  }, [pauseMutation])
  
  const resumeAll = useCallback(() => {
    const tasks = useDownloadStore.getState().tasks
    Object.values(tasks).forEach((task) => {
      if (task.status === "paused") {
        resumeMutation.mutate({ downloadId: task.downloadId })
      }
    })
  }, [resumeMutation])
  
  const cancelAll = useCallback(() => {
    const tasks = useDownloadStore.getState().tasks
    Object.values(tasks).forEach((task) => {
      if (task.status !== "completed" && task.status !== "error") {
        cancelMutation.mutate({ downloadId: task.downloadId })
        useDownloadStore.getState()._removeTask(task.downloadId)
      }
    })
  }, [cancelMutation])
  
  return {
    startDownload,
    pauseDownload,
    resumeDownload,
    cancelDownload,
    pauseAll,
    resumeAll,
    cancelAll,
  }
}
