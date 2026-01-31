import { create } from "zustand"

export type DownloadStatus = "queued" | "downloading" | "paused" | "completed" | "error" | "cancelled"

export type DownloadTask = {
  downloadId: string // Stable ID: gameId:modId:version
  modId: string
  gameId: string
  modName: string
  modVersion: string
  modAuthor: string
  modIconUrl: string
  status: DownloadStatus
  progress: number // 0-100
  bytesDownloaded: number
  bytesTotal: number
  speedBps: number // bytes per second
  error?: string
  archivePath?: string // Full path to downloaded .zip file
  extractedPath?: string // Full path to extracted mod folder
}

type DownloadStore = {
  tasks: Record<string, DownloadTask>
  
  // Actions (internal - used by event handlers)
  _addTask: (task: DownloadTask) => void
  _updateTask: (downloadId: string, updates: Partial<DownloadTask>) => void
  _removeTask: (downloadId: string) => void
  
  // Queries
  getTask: (downloadId: string) => DownloadTask | undefined
  getTasksByGame: (gameId: string) => DownloadTask[]
  getDownloadingTasks: () => DownloadTask[]
  getQueuedTasks: () => DownloadTask[]
  getPausedTasks: () => DownloadTask[]
  getAllActiveTasks: () => DownloadTask[]
}

export const useDownloadStore = create<DownloadStore>((set, get) => ({
  tasks: {},
  
  _addTask: (task) => {
    set((state) => ({
      tasks: {
        ...state.tasks,
        [task.downloadId]: task,
      },
    }))
  },
  
  _updateTask: (downloadId, updates) => {
    set((state) => {
      const task = state.tasks[downloadId]
      if (!task) return state
      
      return {
        tasks: {
          ...state.tasks,
          [downloadId]: {
            ...task,
            ...updates,
          },
        },
      }
    })
  },
  
  _removeTask: (downloadId) => {
    set((state) => {
      const newTasks = { ...state.tasks }
      delete newTasks[downloadId]
      return { tasks: newTasks }
    })
  },
  
  // Queries
  getTask: (downloadId) => {
    return get().tasks[downloadId]
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
