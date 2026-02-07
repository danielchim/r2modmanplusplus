/**
 * Base dependencies check and installation
 * Handles preflight validation and explicit installation of BepInEx/modloader files
 */
import { promises as fs } from "fs"
import { join } from "path"
import { pathExists } from "../downloads/fs-utils"
import { ensureBepInExPack, copyBepInExToProfile } from "./bepinex-bootstrap"

/**
 * Result of checking base dependencies
 */
export interface CheckBaseDependenciesResult {
  needsInstall: boolean
  missing: string[]
}

/**
 * Result of installing base dependencies
 */
export interface InstallBaseDependenciesResult {
  success: boolean
  error?: string
  filesInstalled?: number
  packageUuid4?: string
  packageId?: string
  version?: string
}

const DOORSTOP_PROXY_DLLS = ["winhttp.dll", "version.dll", "winmm.dll"] as const

// Known BepInEx Preloader DLL filenames (Mono and IL2CPP variants)
const KNOWN_PRELOADER_DLLS = [
  "BepInEx.Preloader.dll",           // Mono
  "BepInEx.IL2CPP.dll",              // IL2CPP
  "BepInEx.Preloader.Core.dll",     // Core variant
] as const

/**
 * Checks if a filename is a known BepInEx Preloader DLL
 */
function isPreloaderDll(name: string): boolean {
  const normalized = name.toLowerCase()
  
  // First check against known filenames
  if (KNOWN_PRELOADER_DLLS.some(known => normalized === known.toLowerCase())) {
    return true
  }
  
  // Fallback: substring scan for "preloader" (for unknown variants)
  return normalized.includes("preloader") && normalized.endsWith(".dll")
}

/**
 * Checks if base dependencies are installed in the profile
 * Returns which files are missing and whether installation is needed
 */
export async function checkBaseDependencies(
  profileRoot: string
): Promise<CheckBaseDependenciesResult> {
  const missing: string[] = []
  
  // 1. Check for Doorstop proxy DLL
  let hasProxy = false
  for (const proxyName of DOORSTOP_PROXY_DLLS) {
    if (await pathExists(join(profileRoot, proxyName))) {
      hasProxy = true
      break
    }
  }
  if (!hasProxy) {
    missing.push("Doorstop proxy DLL (winhttp.dll/version.dll/winmm.dll)")
  }
  
  // 2. Check for doorstop_config.ini
  const doorstopConfigPath = join(profileRoot, "doorstop_config.ini")
  if (!(await pathExists(doorstopConfigPath))) {
    missing.push("doorstop_config.ini")
  }
  
  // 3. Check for BepInEx/core directory
  const coreDir = join(profileRoot, "BepInEx", "core")
  if (!(await pathExists(coreDir))) {
    missing.push("BepInEx/core directory")
  } else {
    // Check for preloader DLL (can be directly in core or in subdirectories)
    try {
      const coreEntries = await fs.readdir(coreDir)
      let hasPreloader = coreEntries.some(name => isPreloaderDll(name))
      
      // If not found in root, check subdirectories
      if (!hasPreloader) {
        for (const entry of coreEntries) {
          const subPath = join(coreDir, entry)
          try {
            const stat = await fs.stat(subPath)
            if (stat.isDirectory()) {
              const subEntries = await fs.readdir(subPath)
              if (subEntries.some(name => isPreloaderDll(name))) {
                hasPreloader = true
                break
              }
            }
          } catch {
            // Ignore errors reading subdirectories
          }
        }
      }
      
      if (!hasPreloader) {
        missing.push("BepInEx Preloader DLL")
      }
    } catch {
      missing.push("BepInEx Preloader DLL")
    }
  }
  
  return {
    needsInstall: missing.length > 0,
    missing,
  }
}

/**
 * Installs base dependencies to the profile
 * Downloads and copies BepInEx pack files without launching the game
 */
export async function installBaseDependencies(
  gameId: string,
  profileRoot: string,
  packageIndexUrl: string,
  modloaderPackage?: {
    owner: string
    name: string
    rootFolder: string
  }
): Promise<InstallBaseDependenciesResult> {
  const packageOwner = modloaderPackage?.owner || "BepInEx"
  const packageName = modloaderPackage?.name || "BepInExPack"
  const packageId = `${packageOwner}-${packageName}`
  
  console.log(`[BaseDependencies] Installing ${packageId} for ${gameId}`)
  console.log(`[BaseDependencies] Profile root: ${profileRoot}`)
  console.log(`[BaseDependencies] Package index: ${packageIndexUrl}`)
  
  try {
    // Ensure BepInEx pack is available (download if needed)
    console.log(`[BaseDependencies] Fetching ${packageId} from catalog...`)
    const bepInExResult = await ensureBepInExPack(gameId, packageIndexUrl, modloaderPackage)
    
    if (!bepInExResult.available) {
      const errorMsg = bepInExResult.error || "Failed to prepare BepInEx"
      console.error(`[BaseDependencies] Failed to prepare ${packageId}: ${errorMsg}`)
      return {
        success: false,
        error: errorMsg,
      }
    }
    
    const installedVersion = bepInExResult.version!
    console.log(`[BaseDependencies] ${packageId} v${installedVersion} ready at ${bepInExResult.bootstrapRoot}`)
    
    // Copy BepInEx to profile root
    console.log(`[BaseDependencies] Copying ${packageId} files to profile...`)
    await copyBepInExToProfile(bepInExResult.bootstrapRoot!, profileRoot)
    console.log(`[BaseDependencies] Files copied successfully`)
    
    // Verify installation
    const checkResult = await checkBaseDependencies(profileRoot)
    
    if (checkResult.needsInstall) {
      console.error(`[BaseDependencies] Installation verification failed - still missing components:`, checkResult.missing)
      return {
        success: false,
        error: `Installation incomplete: ${checkResult.missing.join(", ")}`,
      }
    }
    
    const filesInstalled = 3 // Doorstop proxy, doorstop_config.ini, BepInEx/core
    console.log(`[BaseDependencies] Installation complete and verified - ${filesInstalled} components installed`)
    
    return {
      success: true,
      filesInstalled,
      packageUuid4: bepInExResult.uuid4,
      packageId,
      version: installedVersion,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack : undefined
    console.error(`[BaseDependencies] Installation failed:`, error)
    if (stack) {
      console.error(`[BaseDependencies] Stack trace:`, stack)
    }
    
    return {
      success: false,
      error: `Failed to install base dependencies: ${message}`,
    }
  }
}
