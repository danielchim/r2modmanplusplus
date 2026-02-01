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
    // Check for preloader DLL
    try {
      const coreEntries = await fs.readdir(coreDir)
      const hasPreloader = coreEntries.some(name => isPreloaderDll(name))
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
  console.log(`[BaseDependencies] Installing base dependencies for ${gameId} to ${profileRoot}`)
  
  try {
    // Ensure BepInEx pack is available (download if needed)
    const bepInExResult = await ensureBepInExPack(gameId, packageIndexUrl, modloaderPackage)
    
    if (!bepInExResult.available) {
      console.error(`[BaseDependencies] Failed to prepare BepInEx: ${bepInExResult.error}`)
      return {
        success: false,
        error: bepInExResult.error || "Failed to prepare BepInEx",
      }
    }
    
    console.log(`[BaseDependencies] BepInEx pack ready at ${bepInExResult.bootstrapRoot}`)
    
    // Copy BepInEx to profile root
    await copyBepInExToProfile(bepInExResult.bootstrapRoot!, profileRoot)
    
    // Count files installed
    const checkResult = await checkBaseDependencies(profileRoot)
    const filesInstalled = 3 - checkResult.missing.length // Rough estimate
    
    console.log(`[BaseDependencies] Installation complete, ${filesInstalled} components installed`)
    
    return {
      success: true,
      filesInstalled,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[BaseDependencies] Installation failed:`, error)
    
    return {
      success: false,
      error: `Failed to install base dependencies: ${message}`,
    }
  }
}
