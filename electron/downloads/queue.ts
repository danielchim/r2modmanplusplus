/**
 * Download queue manager with concurrency control
 * Manages multiple concurrent downloads with progress tracking
 */
import { EventEmitter } from "events"
import { downloadMod, type DownloadResult } from "./downloader"

/**
 * Download job status
 */
export type DownloadStatus = "queued" | "downloading" | "paused" | "completed" | "error" | "cancelled"

/**
 * Download job
 */
export interface DownloadJob {
  downloadId: string
  gameId: string
  modId: string
  author: string
  name: string
  version: string
  downloadUrl: string
  archivePath: string
  extractPath: string
  ignoreCache: boolean
  status: DownloadStatus
  bytesDownloaded: number
  bytesTotal: number
  speedBps: number
  error?: string
  result?: DownloadResult
  abortController?: AbortController
}

/**
 * Download queue events
 */
export interface DownloadQueueEvents {
  "job-updated": (job: DownloadJob) => void
  "job-progress": (downloadId: string, bytesDownloaded: number, bytesTotal: number, speedBps: number) => void
  "job-completed": (downloadId: string, result: DownloadResult) => void
  "job-failed": (downloadId: string, error: string) => void
}

/**
 * Download queue manager
 */
export class DownloadQueue extends EventEmitter {
  private jobs = new Map<string, DownloadJob>()
  private maxConcurrent: number
  private speedLimitBps: number
  private lastProgressUpdate = new Map<string, number>()
  
  constructor(maxConcurrent = 3, speedLimitBps = 0) {
    super()
    this.maxConcurrent = maxConcurrent
    this.speedLimitBps = speedLimitBps
  }
  
  /**
   * Enqueues a download
   */
  enqueue(job: Omit<DownloadJob, "status" | "bytesDownloaded" | "bytesTotal" | "speedBps">): string {
    const fullJob: DownloadJob = {
      ...job,
      status: "queued",
      bytesDownloaded: 0,
      bytesTotal: 0,
      speedBps: 0,
    }
    
    this.jobs.set(job.downloadId, fullJob)
    this.emit("job-updated", fullJob)
    
    // Try to start immediately if slots available
    this.processQueue()
    
    return job.downloadId
  }
  
  /**
   * Cancels a download
   */
  cancel(downloadId: string): void {
    const job = this.jobs.get(downloadId)
    if (!job) return
    
    if (job.status === "downloading" && job.abortController) {
      job.abortController.abort()
    }
    
    job.status = "cancelled"
    this.jobs.delete(downloadId)
    this.emit("job-updated", job)
  }
  
  /**
   * Pauses a download
   */
  pause(downloadId: string): void {
    const job = this.jobs.get(downloadId)
    if (!job) return
    
    if (job.status === "downloading" && job.abortController) {
      job.abortController.abort()
    }
    
    job.status = "paused"
    this.emit("job-updated", job)
    
    // Start next queued job
    this.processQueue()
  }
  
  /**
   * Resumes a paused download
   */
  resume(downloadId: string): void {
    const job = this.jobs.get(downloadId)
    if (!job || job.status !== "paused") return
    
    job.status = "queued"
    this.emit("job-updated", job)
    
    this.processQueue()
  }
  
  /**
   * Updates concurrency limit
   */
  setMaxConcurrent(max: number): void {
    this.maxConcurrent = max
    this.processQueue()
  }
  
  /**
   * Updates speed limit
   */
  setSpeedLimit(speedLimitBps: number): void {
    this.speedLimitBps = speedLimitBps
  }
  
  /**
   * Gets all jobs
   */
  getJobs(): DownloadJob[] {
    return Array.from(this.jobs.values())
  }
  
  /**
   * Gets a specific job
   */
  getJob(downloadId: string): DownloadJob | undefined {
    return this.jobs.get(downloadId)
  }
  
  /**
   * Clears completed/failed/cancelled jobs
   */
  clearInactive(): void {
    for (const [id, job] of this.jobs.entries()) {
      if (job.status === "completed" || job.status === "error" || job.status === "cancelled") {
        this.jobs.delete(id)
      }
    }
  }
  
  /**
   * Process queue - start downloads up to concurrency limit
   */
  private processQueue(): void {
    const activeCount = Array.from(this.jobs.values()).filter(j => j.status === "downloading").length
    const availableSlots = this.maxConcurrent - activeCount
    
    if (availableSlots <= 0) return
    
    // Get queued jobs
    const queued = Array.from(this.jobs.values())
      .filter(j => j.status === "queued")
      .slice(0, availableSlots)
    
    // Start each queued job
    for (const job of queued) {
      this.startDownload(job)
    }
  }
  
  /**
   * Starts a download job
   */
  private async startDownload(job: DownloadJob): Promise<void> {
    job.status = "downloading"
    job.abortController = new AbortController()
    job.bytesDownloaded = 0
    job.speedBps = 0
    this.emit("job-updated", job)
    
    let lastBytes = 0
    let lastTime = Date.now()
    
    try {
      const result = await downloadMod({
        gameId: job.gameId,
        author: job.author,
        name: job.name,
        version: job.version,
        downloadUrl: job.downloadUrl,
        archivePath: job.archivePath,
        extractPath: job.extractPath,
        ignoreCache: job.ignoreCache,
        speedLimitBps: this.speedLimitBps > 0 ? this.speedLimitBps : undefined,
        abortSignal: job.abortController.signal,
        onProgress: (bytesDownloaded, bytesTotal) => {
          job.bytesDownloaded = bytesDownloaded
          job.bytesTotal = bytesTotal
          
          // Calculate speed
          const now = Date.now()
          const elapsed = (now - lastTime) / 1000
          if (elapsed >= 0.5) {
            const bytesDelta = bytesDownloaded - lastBytes
            job.speedBps = Math.round(bytesDelta / elapsed)
            lastBytes = bytesDownloaded
            lastTime = now
            
            // Throttle progress events (max once per 200ms)
            const lastUpdate = this.lastProgressUpdate.get(job.downloadId) || 0
            if (now - lastUpdate >= 200) {
              this.emit("job-progress", job.downloadId, bytesDownloaded, bytesTotal, job.speedBps)
              this.lastProgressUpdate.set(job.downloadId, now)
            }
          }
        },
      })
      
      // Success
      job.status = "completed"
      job.result = result
      job.bytesDownloaded = result.bytesTotal
      job.bytesTotal = result.bytesTotal
      job.speedBps = 0
      
      this.emit("job-updated", job)
      this.emit("job-completed", job.downloadId, result)
      
    } catch (error: unknown) {
      // Failure (unless already marked as paused/cancelled by another handler)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      
      // Only mark as error if not already cancelled/paused
      if (job.status === "downloading") {
        job.status = "error"
        job.error = errorMessage
        job.speedBps = 0
        
        this.emit("job-updated", job)
        this.emit("job-failed", job.downloadId, errorMessage)
      }
    } finally {
      // Start next job in queue
      this.processQueue()
    }
  }
}
