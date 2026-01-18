import { create } from "zustand"

export type DownloadStatus = "queued" | "downloading" | "paused" | "completed" | "error"

export type DownloadTask = {
  modId: string
  gameId: string
  modName: string
  modVersion: string
  modAuthor: string
  status: DownloadStatus
  progress: number // 0-100
  bytesDownloaded: number
  bytesTotal: number
  speedBps: number // bytes per second
  error?: string
  // Internal tracking
  lastTickAt: number
  lastBytesDownloaded: number
}

type DownloadStore = {
  tasks: Record<string, DownloadTask>
  
  // Actions
  startDownload: (modId: string, gameId: string, modName: string, modVersion: string, modAuthor: string) => void
  pauseDownload: (modId: string) => void
  resumeDownload: (modId: string) => void
  cancelDownload: (modId: string) => void
  pauseAll: () => void
  resumeAll: () => void
  cancelAll: () => void
  updateProgress: (modId: string, bytesDownloaded: number, speedBps: number) => void
  completeDownload: (modId: string) => void
  failDownload: (modId: string, error: string) => void
  setStatus: (modId: string, status: DownloadStatus) => void
  
  // Queries
  getTask: (modId: string) => DownloadTask | undefined
  getTasksByGame: (gameId: string) => DownloadTask[]
  getDownloadingTasks: () => DownloadTask[]
  getQueuedTasks: () => DownloadTask[]
  getPausedTasks: () => DownloadTask[]
  getAllActiveTasks: () => DownloadTask[]
}

export const useDownloadStore = create<DownloadStore>((set, get) => ({
  tasks: {},
  
  startDownload: (modId, gameId, modName, modVersion, modAuthor) => {
    set((state) => {
      // Generate a random file size between 5MB and 100MB for simulation
      const bytesTotal = Math.floor(Math.random() * (100 * 1024 * 1024 - 5 * 1024 * 1024) + 5 * 1024 * 1024)
      
      return {
        tasks: {
          ...state.tasks,
          [modId]: {
            modId,
            gameId,
            modName,
            modVersion,
            modAuthor,
            status: "queued",
            progress: 0,
            bytesDownloaded: 0,
            bytesTotal,
            speedBps: 0,
            lastTickAt: Date.now(),
            lastBytesDownloaded: 0,
          },
        },
      }
    })
  },
  
  pauseDownload: (modId) => {
    set((state) => {
      const task = state.tasks[modId]
      if (!task || task.status !== "downloading") return state
      
      return {
        tasks: {
          ...state.tasks,
          [modId]: {
            ...task,
            status: "paused",
            speedBps: 0,
          },
        },
      }
    })
  },
  
  resumeDownload: (modId) => {
    set((state) => {
      const task = state.tasks[modId]
      if (!task || task.status !== "paused") return state
      
      // Force-start: set to downloading immediately
      // The DownloadManager will handle popping the last task out if needed
      return {
        tasks: {
          ...state.tasks,
          [modId]: {
            ...task,
            status: "downloading",
            lastTickAt: Date.now(),
            lastBytesDownloaded: task.bytesDownloaded,
          },
        },
      }
    })
  },
  
  cancelDownload: (modId) => {
    set((state) => {
      const newTasks = { ...state.tasks }
      delete newTasks[modId]
      return { tasks: newTasks }
    })
  },
  
  pauseAll: () => {
    set((state) => {
      const newTasks = { ...state.tasks }
      Object.keys(newTasks).forEach((modId) => {
        const task = newTasks[modId]
        if (task.status === "downloading" || task.status === "queued") {
          newTasks[modId] = {
            ...task,
            status: "paused",
            speedBps: 0,
          }
        }
      })
      return { tasks: newTasks }
    })
  },
  
  resumeAll: () => {
    set((state) => {
      const newTasks = { ...state.tasks }
      Object.keys(newTasks).forEach((modId) => {
        const task = newTasks[modId]
        if (task.status === "paused") {
          // Set to queued instead of downloading to respect max concurrent downloads
          // DownloadManager will promote them to downloading when slots are available
          newTasks[modId] = {
            ...task,
            status: "queued",
            speedBps: 0,
          }
        }
      })
      return { tasks: newTasks }
    })
  },
  
  cancelAll: () => {
    set((state) => {
      const newTasks = { ...state.tasks }
      Object.keys(newTasks).forEach((modId) => {
        const task = newTasks[modId]
        // Only cancel active tasks (not completed or errored)
        if (task.status === "downloading" || task.status === "queued" || task.status === "paused") {
          delete newTasks[modId]
        }
      })
      return { tasks: newTasks }
    })
  },
  
  updateProgress: (modId, bytesDownloaded, speedBps) => {
    set((state) => {
      const task = state.tasks[modId]
      if (!task) return state
      
      const progress = Math.min(100, Math.round((bytesDownloaded / task.bytesTotal) * 100))
      
      return {
        tasks: {
          ...state.tasks,
          [modId]: {
            ...task,
            bytesDownloaded,
            progress,
            speedBps,
            lastTickAt: Date.now(),
            lastBytesDownloaded: bytesDownloaded,
          },
        },
      }
    })
  },
  
  completeDownload: (modId) => {
    set((state) => {
      const task = state.tasks[modId]
      if (!task) return state
      
      return {
        tasks: {
          ...state.tasks,
          [modId]: {
            ...task,
            status: "completed",
            progress: 100,
            bytesDownloaded: task.bytesTotal,
            speedBps: 0,
          },
        },
      }
    })
  },
  
  failDownload: (modId, error) => {
    set((state) => {
      const task = state.tasks[modId]
      if (!task) return state
      
      return {
        tasks: {
          ...state.tasks,
          [modId]: {
            ...task,
            status: "error",
            speedBps: 0,
            error,
          },
        },
      }
    })
  },
  
  setStatus: (modId, status) => {
    set((state) => {
      const task = state.tasks[modId]
      if (!task) return state
      
      return {
        tasks: {
          ...state.tasks,
          [modId]: {
            ...task,
            status,
          },
        },
      }
    })
  },
  
  // Queries
  getTask: (modId) => {
    return get().tasks[modId]
  },
  
  getTasksByGame: (gameId) => {
    return Object.values(get().tasks).filter((task) => task.gameId === gameId)
  },
  
  getDownloadingTasks: () => {
    return Object.values(get().tasks).filter((task) => task.status === "downloading")
  },
  
  getQueuedTasks: () => {
    return Object.values(get().tasks).filter((task) => task.status === "queued")
  },
  
  getPausedTasks: () => {
    return Object.values(get().tasks).filter((task) => task.status === "paused")
  },
  
  getAllActiveTasks: () => {
    return Object.values(get().tasks).filter(
      (task) => task.status === "queued" || task.status === "downloading" || task.status === "paused"
    )
  },
}))
