import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { useDownloadStore } from "@/store/download-store"
import { useModManagementStore } from "@/store/mod-management-store"
import { useProfileStore } from "@/store/profile-store"
import { useSettingsStore } from "@/store/settings-store"

const TICK_INTERVAL = 500 // ms
const MIN_SPEED_BPS = 500 * 1024 // 500 KB/s
const MAX_SPEED_BPS = 15 * 1024 * 1024 // 15 MB/s
const FAILURE_CHANCE = 0.001 // 0.1% chance per tick

export function DownloadManager() {
  const tasks = useDownloadStore((s) => s.tasks)
  const getDownloadingTasks = useDownloadStore((s) => s.getDownloadingTasks)
  const getQueuedTasks = useDownloadStore((s) => s.getQueuedTasks)
  const updateProgress = useDownloadStore((s) => s.updateProgress)
  const completeDownload = useDownloadStore((s) => s.completeDownload)
  const failDownload = useDownloadStore((s) => s.failDownload)
  const setStatus = useDownloadStore((s) => s.setStatus)
  const cancelDownload = useDownloadStore((s) => s.cancelDownload)
  
  const installMod = useModManagementStore((s) => s.installMod)
  const activeProfileIdByGame = useProfileStore((s) => s.activeProfileIdByGame)
  
  const maxConcurrentDownloads = useSettingsStore((s) => s.global.maxConcurrentDownloads)
  const speedLimitEnabled = useSettingsStore((s) => s.global.speedLimitEnabled)
  const speedLimitBps = useSettingsStore((s) => s.global.speedLimitBps)
  
  const previousTasksRef = useRef<Record<string, any>>({})
  const scheduledCleanupRef = useRef<Set<string>>(new Set())

  // Monitor status transitions and fire toasts
  useEffect(() => {
    const currentTasks = tasks
    const previousTasks = previousTasksRef.current

    Object.entries(currentTasks).forEach(([modId, task]) => {
      const prevTask = previousTasks[modId]
      
      // New task started downloading
      if (!prevTask && task.status === "downloading") {
        toast.info(`Downloading ${task.modName}...`)
      }
      
      // Status changed to downloading
      if (prevTask && prevTask.status !== "downloading" && task.status === "downloading") {
        toast.info(`Downloading ${task.modName}...`)
      }
      
      // Completed
      if (prevTask && prevTask.status !== "completed" && task.status === "completed") {
        const profileId = activeProfileIdByGame[task.gameId]
        if (profileId) {
          toast.success(`${task.modName} installed successfully`)
          installMod(profileId, task.modId, task.modVersion)
        } else {
          toast.error(`Cannot install ${task.modName}: No active profile. Set game install folder first.`)
        }
      }
      
      // Failed
      if (prevTask && prevTask.status !== "error" && task.status === "error") {
        toast.error(`Failed to download ${task.modName}`, {
          description: task.error || "Unknown error",
        })
      }
    })

    previousTasksRef.current = currentTasks
  }, [tasks, installMod, activeProfileIdByGame])

  // Simulation tick
  useEffect(() => {
    const interval = setInterval(() => {
      let downloading = getDownloadingTasks()
      const queued = getQueuedTasks()
      
      // Force-start logic: if downloading exceeds max concurrent, pause the excess
      if (downloading.length > maxConcurrentDownloads) {
        const tasksToPause = downloading.slice(maxConcurrentDownloads)
        tasksToPause.forEach((task) => {
          setStatus(task.modId, "paused")
        })
        // Recompute downloading after pausing
        downloading = getDownloadingTasks()
      }
      
      // Promote queued tasks if slots available
      const availableSlots = maxConcurrentDownloads - downloading.length
      if (availableSlots > 0 && queued.length > 0) {
        queued.slice(0, availableSlots).forEach((task) => {
          setStatus(task.modId, "downloading")
        })
      }
      
      // Update progress for downloading tasks (use the recomputed list)
      downloading.forEach((task) => {
        // Random failure simulation
        if (Math.random() < FAILURE_CHANCE) {
          failDownload(task.modId, "Network connection lost")
          return
        }
        
        // Calculate speed (randomized but capped by settings)
        let speedBps = Math.random() * (MAX_SPEED_BPS - MIN_SPEED_BPS) + MIN_SPEED_BPS
        if (speedLimitEnabled && speedLimitBps > 0) {
          speedBps = Math.min(speedBps, speedLimitBps)
        }
        
        // Calculate bytes to add based on tick interval
        const bytesToAdd = (speedBps * TICK_INTERVAL) / 1000
        const newBytesDownloaded = Math.min(
          task.bytesDownloaded + bytesToAdd,
          task.bytesTotal
        )
        
        updateProgress(task.modId, newBytesDownloaded, speedBps)
        
        // Check if completed
        if (newBytesDownloaded >= task.bytesTotal) {
          completeDownload(task.modId)
        }
      })
    }, TICK_INTERVAL)
    
    return () => clearInterval(interval)
  }, [
    getDownloadingTasks,
    getQueuedTasks,
    updateProgress,
    completeDownload,
    failDownload,
    setStatus,
    maxConcurrentDownloads,
    speedLimitEnabled,
    speedLimitBps,
  ])
  
  // Auto-cleanup completed tasks after 10 seconds
  useEffect(() => {
    const completedTasks = Object.values(tasks).filter((t) => t.status === "completed")
    
    completedTasks.forEach((task) => {
      // Only schedule cleanup if not already scheduled for this modId
      if (!scheduledCleanupRef.current.has(task.modId)) {
        scheduledCleanupRef.current.add(task.modId)
        
        setTimeout(() => {
          cancelDownload(task.modId)
          scheduledCleanupRef.current.delete(task.modId)
        }, 10000)
      }
    })
  }, [tasks, cancelDownload])

  return null
}
