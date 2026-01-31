/**
 * Download manager singleton
 * Manages the global download queue and settings integration
 */
import { BrowserWindow } from "electron"
import { DownloadQueue, type DownloadJob } from "./queue"
import { resolveGamePaths, getExtractedModPath, getArchivePath, applyThunderstoreCdn, type PathSettings } from "./path-resolver"
import { logIpcRenderer } from "@/lib/logger"

/**
 * Settings fetcher function (provided by main process)
 */
export type SettingsFetcher = () => PathSettings

/**
 * Download manager
 */
export class DownloadManager {
  private queue: DownloadQueue
  private settingsFetcher: SettingsFetcher
  private windows: BrowserWindow[] = []
  
  constructor(settingsFetcher: SettingsFetcher, maxConcurrent = 3, speedLimitBps = 0) {
    this.settingsFetcher = settingsFetcher
    this.queue = new DownloadQueue(maxConcurrent, speedLimitBps)
    
    // Forward queue events to renderer windows
    this.queue.on("job-updated", (job) => {
      this.broadcastToRenderers("download:updated", job)
    })
    
    this.queue.on("job-progress", (downloadId, bytesDownloaded, bytesTotal, speedBps) => {
      this.broadcastToRenderers("download:progress", { downloadId, bytesDownloaded, bytesTotal, speedBps })
    })
    
    this.queue.on("job-completed", (downloadId, result) => {
      this.broadcastToRenderers("download:completed", { downloadId, result })
    })
    
    this.queue.on("job-failed", (downloadId, error) => {
      this.broadcastToRenderers("download:failed", { downloadId, error })
    })
  }
  
  /**
   * Registers a window to receive download events
   */
  registerWindow(window: BrowserWindow): void {
    if (!this.windows.includes(window)) {
      this.windows.push(window)
    }
    
    // Clean up when window closes
    window.on("closed", () => {
      this.windows = this.windows.filter(w => w !== window)
    })
  }
  
  /**
   * Broadcasts an event to all registered renderer windows
   */
  private broadcastToRenderers(channel: string, data: unknown): void {
    logIpcRenderer("main->renderer", channel, data)
    for (const window of this.windows) {
      if (!window.isDestroyed()) {
        window.webContents.send(channel, data)
      }
    }
  }
  
  /**
   * Enqueues a download
   */
  enqueue(params: {
    gameId: string
    modId: string
    author: string
    name: string
    version: string
    downloadUrl: string
    preferredCdn: string
    ignoreCache: boolean
  }): string {
    const settings = this.settingsFetcher()
    const paths = resolveGamePaths(params.gameId, settings)
    
    const extractPath = getExtractedModPath(paths.modCacheRoot, params.author, params.name, params.version)
    const archivePath = getArchivePath(paths.archiveRoot, params.author, params.name, params.version)
    const downloadUrl = applyThunderstoreCdn(params.downloadUrl, params.preferredCdn)
    
    const downloadId = `${params.gameId}:${params.modId}:${params.version}`
    
    return this.queue.enqueue({
      downloadId,
      gameId: params.gameId,
      modId: params.modId,
      author: params.author,
      name: params.name,
      version: params.version,
      downloadUrl,
      archivePath,
      extractPath,
      ignoreCache: params.ignoreCache,
    })
  }
  
  /**
   * Cancels a download
   */
  cancel(downloadId: string): void {
    this.queue.cancel(downloadId)
  }
  
  /**
   * Pauses a download
   */
  pause(downloadId: string): void {
    this.queue.pause(downloadId)
  }
  
  /**
   * Resumes a download
   */
  resume(downloadId: string): void {
    this.queue.resume(downloadId)
  }
  
  /**
   * Gets all downloads
   */
  getDownloads(): DownloadJob[] {
    return this.queue.getJobs()
  }
  
  /**
   * Gets a specific download
   */
  getDownload(downloadId: string): DownloadJob | undefined {
    return this.queue.getJob(downloadId)
  }
  
  /**
   * Updates concurrency limit
   */
  setMaxConcurrent(max: number): void {
    this.queue.setMaxConcurrent(max)
  }
  
  /**
   * Updates speed limit
   */
  setSpeedLimit(speedLimitBps: number): void {
    this.queue.setSpeedLimit(speedLimitBps)
  }
  
  /**
   * Clears completed/failed downloads
   */
  clearInactive(): void {
    this.queue.clearInactive()
  }
}

/**
 * Global download manager instance
 */
let instance: DownloadManager | null = null

/**
 * Initializes the download manager
 */
export function initializeDownloadManager(settingsFetcher: SettingsFetcher, maxConcurrent = 3, speedLimitBps = 0): DownloadManager {
  if (!instance) {
    instance = new DownloadManager(settingsFetcher, maxConcurrent, speedLimitBps)
  }
  return instance
}

/**
 * Gets the download manager instance
 */
export function getDownloadManager(): DownloadManager {
  if (!instance) {
    throw new Error("Download manager not initialized")
  }
  return instance
}
