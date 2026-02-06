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
 * On macOS, handles .app bundles by checking inside Contents/MacOS/
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
    // First check at root level (Windows, Linux)
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

    // On macOS, if exeName is a .app bundle, check inside Contents/MacOS/
    if (process.platform === "darwin" && exeName.endsWith(".app")) {
      // The .app bundle might be the install folder itself
      if (installFolder.endsWith(".app")) {
        // Extract the executable name from the .app name
        // e.g., "Game.app" -> "Game"
        const appBaseName = exeName.replace(/\.app$/, "")
        const macosPath = join(installFolder, "Contents", "MacOS", appBaseName)

        if (await pathExists(macosPath)) {
          try {
            const stat = await fs.stat(macosPath)
            if (stat.isFile()) {
              return {
                ok: true,
                exePath: macosPath,
              }
            }
          } catch (error) {
            // Continue to next candidate
            continue
          }
        }

        // Also try the full .app name as executable
        const macosPathWithApp = join(installFolder, "Contents", "MacOS", exeName.replace(/\.app$/, ""))
        if (await pathExists(macosPathWithApp)) {
          try {
            const stat = await fs.stat(macosPathWithApp)
            if (stat.isFile()) {
              return {
                ok: true,
                exePath: macosPathWithApp,
              }
            }
          } catch (error) {
            // Continue to next candidate
            continue
          }
        }
      }
    }
  }

  return {
    ok: false,
    reason: `Game executable not found. Expected one of: ${exeNames.join(", ")}`,
  }
}
