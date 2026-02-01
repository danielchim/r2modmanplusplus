/**
 * Binary verification utility
 * Checks if game executable exists in install folder
 */
import { promises as fs } from "fs"
import { join } from "path"
import { pathExists } from "../downloads/fs-utils"

/**
 * Result of binary verification
 */
export interface VerifyBinaryResult {
  ok: boolean
  exePath?: string
  reason?: string
}

/**
 * Verifies that a game binary exists in the install folder
 * Checks all possible exe names and returns the first match
 */
export async function verifyBinary(
  installFolder: string,
  exeNames: string[]
): Promise<VerifyBinaryResult> {
  if (!installFolder || !installFolder.trim()) {
    return {
      ok: false,
      reason: "Install folder not set",
    }
  }
  
  // Check if install folder exists
  if (!(await pathExists(installFolder))) {
    return {
      ok: false,
      reason: "Install folder does not exist",
    }
  }
  
  // Check each exe name
  for (const exeName of exeNames) {
    const exePath = join(installFolder, exeName)
    
    if (await pathExists(exePath)) {
      // Verify it's a file
      try {
        const stat = await fs.stat(exePath)
        if (stat.isFile()) {
          return {
            ok: true,
            exePath,
          }
        }
      } catch (error) {
        // Continue to next candidate
        continue
      }
    }
  }
  
  return {
    ok: false,
    reason: `Game executable not found. Expected one of: ${exeNames.join(", ")}`,
  }
}
