/**
 * Utilities for fetching and processing gzip-compressed JSON blobs from Thunderstore
 */
import { createHash } from "crypto"
import { gunzip } from "zlib"
import { promisify } from "util"

const gunzipAsync = promisify(gunzip)

/**
 * Result of fetching and processing a gzip blob
 */
export interface BlobResult<T = unknown> {
  content: T
  hash: string
  fetchedAt: Date
}

/**
 * Allowed Thunderstore CDN hosts for security
 */
const ALLOWED_HOSTS = new Set([
  "thunderstore.io",
  "gcdn.thunderstore.io",
])

/**
 * Validates that a URL is from an allowed Thunderstore host
 * @throws Error if URL is not from an allowed host
 */
function validateThunderstoreUrl(url: string): void {
  let hostname: string
  try {
    hostname = new URL(url).hostname
  } catch (e) {
    throw new Error(`Invalid URL: ${url}`)
  }

  if (!ALLOWED_HOSTS.has(hostname)) {
    throw new Error(`URL not from allowed Thunderstore host: ${hostname}`)
  }
}

/**
 * Computes SHA256 hash of a buffer
 */
function computeHash(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex")
}

/**
 * Fetches a gzip-compressed JSON blob from a URL, decompresses it, and returns the parsed content
 * 
 * @param url - URL to fetch (must be from thunderstore.io or gcdn.thunderstore.io)
 * @param timeoutMs - Request timeout in milliseconds (default: 60 seconds)
 * @returns Parsed JSON content, SHA256 hash of compressed data, and fetch timestamp
 * @throws Error if fetch fails, URL is invalid, or decompression/parsing fails
 */
export async function fetchGzipJson<T = unknown>(
  url: string,
  timeoutMs = 60000
): Promise<BlobResult<T>> {
  // Validate URL for security
  validateThunderstoreUrl(url)

  const fetchedAt = new Date()

  // Create abort controller for timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    // Fetch compressed data
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "Accept": "application/json, application/octet-stream",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    // Get raw buffer
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Compute hash of compressed data
    const hash = computeHash(buffer)

    // Decompress
    const decompressed = await gunzipAsync(buffer)
    const jsonString = decompressed.toString("utf-8")

    // Parse JSON
    const content = JSON.parse(jsonString) as T

    return {
      content,
      hash,
      fetchedAt,
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error(`Request timeout after ${timeoutMs}ms: ${url}`)
      }
      throw new Error(`Failed to fetch gzip blob from ${url}: ${error.message}`)
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}
