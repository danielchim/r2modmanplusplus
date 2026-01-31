/**
 * Filesystem utilities for safe file operations
 */
import { promises as fs } from "fs"
import { dirname, join, resolve, normalize } from "path"
import { createWriteStream } from "fs"
import { randomBytes } from "crypto"

/**
 * Ensures a directory exists, creating it recursively if needed
 */
export async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true })
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && error.code !== "EEXIST") {
      throw error
    }
  }
}

/**
 * Checks if a path exists
 */
export async function pathExists(path: string): Promise<boolean> {
  try {
    await fs.access(path)
    return true
  } catch {
    return false
  }
}

/**
 * Atomically writes data to a file using temp + rename
 * 
 * @param filePath - Destination file path
 * @param data - Data to write
 */
export async function atomicWrite(filePath: string, data: string | Buffer): Promise<void> {
  const dir = dirname(filePath)
  await ensureDir(dir)
  
  const tempPath = `${filePath}.${randomBytes(8).toString("hex")}.tmp`
  
  try {
    await fs.writeFile(tempPath, data)
    await fs.rename(tempPath, filePath)
  } catch (error) {
    // Cleanup temp file on failure
    try {
      await fs.unlink(tempPath)
    } catch {
      // Ignore cleanup errors
    }
    throw error
  }
}

/**
 * Validates that a path is safely within a parent directory (Zip Slip protection)
 * 
 * @param parentDir - Parent directory that should contain the path
 * @param childPath - Path to validate
 * @returns True if safe, false if attempts to escape parent
 */
export function isPathSafe(parentDir: string, childPath: string): boolean {
  const normalizedParent = normalize(resolve(parentDir))
  const normalizedChild = normalize(resolve(parentDir, childPath))
  
  return normalizedChild.startsWith(normalizedParent)
}

/**
 * Creates a write stream with automatic directory creation
 * 
 * @param filePath - File path to write to
 * @returns Write stream
 */
export async function createSafeWriteStream(filePath: string) {
  const dir = dirname(filePath)
  await ensureDir(dir)
  return createWriteStream(filePath)
}

/**
 * Safely removes a file, ignoring ENOENT errors
 */
export async function safeUnlink(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath)
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && error.code !== "ENOENT") {
      throw error
    }
  }
}

/**
 * Recursively removes a directory and all contents
 */
export async function removeDir(dirPath: string): Promise<void> {
  try {
    await fs.rm(dirPath, { recursive: true, force: true })
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && error.code !== "ENOENT") {
      throw error
    }
  }
}

/**
 * Recursively copies a directory
 * 
 * @param src - Source directory
 * @param dest - Destination directory
 */
export async function copyDir(src: string, dest: string): Promise<void> {
  await ensureDir(dest)
  
  const entries = await fs.readdir(src, { withFileTypes: true })
  
  for (const entry of entries) {
    const srcPath = join(src, entry.name)
    const destPath = join(dest, entry.name)
    
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath)
    } else {
      await fs.copyFile(srcPath, destPath)
    }
  }
}
