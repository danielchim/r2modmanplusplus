/**
 * Main-process mod downloader with progress tracking and cancellation
 * Mirrors r2modmanPlus BetterThunderstoreDownloader semantics
 */
import { promises as fs } from "fs"
import { createHash } from "crypto"
import { dirname } from "path"
import { pathExists, ensureDir, safeUnlink } from "./fs-utils"
import { extractZip } from "./zip-extractor"
import { getLogger } from "../file-logger"

/**
 * Download options
 */
export interface DownloadOptions {
  gameId: string
  author: string
  name: string
  version: string
  downloadUrl: string
  archivePath: string
  extractPath: string
  ignoreCache: boolean
  speedLimitBps?: number
  onProgress?: (bytesDownloaded: number, bytesTotal: number) => void
  abortSignal?: AbortSignal
}

/**
 * Download result
 */
export interface DownloadResult {
  extractedPath: string
  archivePath: string
  bytesTotal: number
  sha256?: string
  fromCache: boolean
}

/**
 * Token bucket for rate limiting
 */
class TokenBucket {
  private tokens: number
  private lastRefill: number
  private capacity: number
  private refillRate: number
  
  constructor(capacity: number, refillRate: number) {
    this.capacity = capacity
    this.refillRate = refillRate
    this.tokens = capacity
    this.lastRefill = Date.now()
  }
  
  async consume(tokens: number): Promise<void> {
    // Refill tokens based on time elapsed
    const now = Date.now()
    const elapsed = (now - this.lastRefill) / 1000
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate)
    this.lastRefill = now
    
    // Wait if we don't have enough tokens
    if (this.tokens < tokens) {
      const waitTime = ((tokens - this.tokens) / this.refillRate) * 1000
      await new Promise(resolve => setTimeout(resolve, waitTime))
      this.tokens = 0
    } else {
      this.tokens -= tokens
    }
  }
  
  updateRate(newRate: number): void {
    this.refillRate = newRate
  }
}

/**
 * Downloads a mod zip from Thunderstore, extracts it, and returns paths
 * 
 * @param options - Download options
 * @returns Download result with paths and metadata
 * @throws Error if download or extraction fails
 */
export async function downloadMod(options: DownloadOptions): Promise<DownloadResult> {
  const {
    author,
    name,
    version,
    archivePath,
    extractPath,
    ignoreCache,
    downloadUrl,
    speedLimitBps,
    onProgress,
    abortSignal,
  } = options
  
  const logger = getLogger()
  const modId = `${author}-${name}@${version}`
  
  // Check cache hit (if not ignoring cache)
  if (!ignoreCache && await pathExists(extractPath)) {
    logger.info(`Download cache hit for ${modId}`)
    return {
      extractedPath: extractPath,
      archivePath: archivePath,
      bytesTotal: 0,
      fromCache: true,
    }
  }
  
  logger.info(`Starting download for ${modId}`, { downloadUrl, archivePath })
  
  // Ensure parent directories exist
  await ensureDir(extractPath)
  await ensureDir(dirname(archivePath))
  
  // Download to temp file
  const tempArchivePath = `${archivePath}.part`
  
  try {
    // Setup abort handling
    if (abortSignal?.aborted) {
      throw new Error("Download aborted before starting")
    }
    
    // Fetch with streaming
    const response = await fetch(downloadUrl, {
      signal: abortSignal,
      headers: {
        "Accept": "application/zip, application/octet-stream",
      },
    })
    
    if (!response.ok) {
      logger.error(`Download failed for ${modId}: HTTP ${response.status}`)
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const contentLength = parseInt(response.headers.get("content-length") || "0", 10)
    const reader = response.body?.getReader()
    
    if (!reader) {
      throw new Error("Response body is not readable")
    }
    
    // Setup rate limiter if speed limit enabled
    const rateLimiter = speedLimitBps && speedLimitBps > 0
      ? new TokenBucket(speedLimitBps * 2, speedLimitBps)
      : null
    
    // Stream to file
    const fileHandle = await fs.open(tempArchivePath, "w")
    const hasher = createHash("sha256")
    let bytesDownloaded = 0
    
    try {
      while (true) {
        if (abortSignal?.aborted) {
          throw new Error("Download aborted")
        }
        
        const { done, value } = await reader.read()
        
        if (done) break
        
        // Rate limiting
        if (rateLimiter) {
          await rateLimiter.consume(value.length)
        }
        
        // Write chunk
        await fileHandle.write(value)
        hasher.update(value)
        bytesDownloaded += value.length
        
        // Progress callback
        if (onProgress) {
          onProgress(bytesDownloaded, contentLength)
        }
      }
      
      await fileHandle.close()
      
      // Atomically rename to final path
      await fs.rename(tempArchivePath, archivePath)
      
      logger.info(`Download completed for ${modId}, extracting...`, { bytesDownloaded })
      
      // Extract zip
      await extractZip(archivePath, extractPath)
      
      logger.info(`Extraction completed for ${modId}`, { extractPath })
      
      return {
        extractedPath: extractPath,
        archivePath: archivePath,
        bytesTotal: bytesDownloaded,
        sha256: hasher.digest("hex"),
        fromCache: false,
      }
    } catch (error) {
      // Cleanup on error
      await fileHandle.close()
      await safeUnlink(tempArchivePath)
      throw error
    }
  } catch (error: unknown) {
    // Cleanup temp file on any error
    await safeUnlink(tempArchivePath)
    
    if (error instanceof Error) {
      if (error.name === "AbortError" || error.message.includes("aborted")) {
        logger.warn(`Download cancelled for ${modId}`)
        throw new Error("Download was cancelled")
      }
      logger.error(`Download failed for ${modId}: ${error.message}`)
      throw new Error(`Download failed: ${error.message}`)
    }
    throw error
  }
}
