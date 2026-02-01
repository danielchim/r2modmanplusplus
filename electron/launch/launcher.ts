/**
 * Game launcher
 * Handles modded and vanilla game launches with BepInEx injection
 */
import { spawn } from "child_process"
import { promises as fs } from "fs"
import { join } from "path"
import { pathExists } from "../downloads/fs-utils"
import { ensureBepInExPack, copyBepInExToProfile } from "./bepinex-bootstrap"
import { injectFiles } from "./injection-tracker"
import { trackProcess } from "./process-tracker"
import { getLogger } from "../file-logger"

const DOORSTOP_PROXY_DLLS = ["winhttp.dll", "version.dll", "winmm.dll"] as const
const DOORSTOP_METADATA_PREFIXES = ["doorstop", ".doorstop"]

function isDoorstopMetadataFile(name: string): boolean {
  const normalized = name.toLowerCase()
  if (normalized === "doorstop_config.ini") {
    return false
  }
  return DOORSTOP_METADATA_PREFIXES.some(prefix => normalized.startsWith(prefix))
}

/**
 * Launch mode
 */
export type LaunchMode = "modded" | "vanilla"

/**
 * Launch options
 */
export interface LaunchOptions {
  gameId: string
  profileId: string
  mode: LaunchMode
  installFolder: string
  exePath: string
  launchParameters: string
  packageIndexUrl: string
  profileRoot: string
}

/**
 * Result of launch operation
 */
export interface LaunchResult {
  success: boolean
  pid?: number
  error?: string
}

/**
 * Updates doorstop_config.ini with the correct paths and settings
 * Supports both common Doorstop formats:
 * - [UnityDoorstop] with enabled= and targetAssembly=
 * - [General] with enabled = and target_assembly=
 */
async function updateDoorstopConfig(
  configPath: string,
  mode: LaunchMode
): Promise<void> {
  let content: string
  let detectedFormat: "unity_doorstop" | "general" = "unity_doorstop"
  
  try {
    content = await fs.readFile(configPath, "utf-8")
    
    // Detect which format is in use
    if (/^\[General\]/im.test(content)) {
      detectedFormat = "general"
    }
  } catch (error) {
    console.warn("[Launcher] Could not read doorstop_config.ini, creating default")
    // Create a default UnityDoorstop format config
    content = `[UnityDoorstop]
enabled=false
targetAssembly=BepInEx\\core\\BepInEx.Preloader.dll
redirectOutputLog=false
ignoreDisableSwitch=false
`
  }
  
  // Update the config based on mode and format
  if (mode === "modded") {
    if (detectedFormat === "general") {
      // General format uses spaces around = and target_assembly
      content = content.replace(/^enabled\s*=\s*.*/im, "enabled = true")
      
      if (!/^target_assembly\s*=/im.test(content)) {
        // Add target_assembly if missing (under [General] section)
        content = content.replace(/(\[General\][^\[]*)/i, "$1target_assembly=BepInEx\\core\\BepInEx.Preloader.dll\n")
      } else {
        content = content.replace(/^target_assembly\s*=\s*.*/im, "target_assembly=BepInEx\\core\\BepInEx.Preloader.dll")
      }
    } else {
      // UnityDoorstop format
      content = content.replace(/^enabled\s*=/im, "enabled=true")
      
      if (!/^targetAssembly\s*=/im.test(content)) {
        content += "\ntargetAssembly=BepInEx\\core\\BepInEx.Preloader.dll"
      } else {
        content = content.replace(/^targetAssembly\s*=\s*.*/im, "targetAssembly=BepInEx\\core\\BepInEx.Preloader.dll")
      }
    }
  } else {
    // Vanilla mode: disable doorstop (works for both formats)
    if (detectedFormat === "general") {
      content = content.replace(/^enabled\s*=\s*.*/im, "enabled = false")
    } else {
      content = content.replace(/^enabled\s*=/im, "enabled=false")
    }
  }
  
  await fs.writeFile(configPath, content, "utf-8")
  console.log(`[Launcher] Updated doorstop_config.ini: mode=${mode}, format=${detectedFormat}`)
}

/**
 * Builds command-line arguments for game launch
 */
async function buildLaunchArgs(
  launchParameters: string
): Promise<string[]> {
  const args: string[] = []
  
  // Add custom launch parameters
  if (launchParameters.trim()) {
    const customArgs = launchParameters.trim().split(/\s+/)
    args.push(...customArgs)
  }
  
  return args
}

/**
 * Validates that profile has required BepInEx artifacts for modded launch
 * Returns error message if validation fails
 */
async function validateProfileArtifacts(profileRoot: string): Promise<string | null> {
  // 1. Check for Doorstop proxy DLL
  let hasProxy = false
  
  for (const proxyName of DOORSTOP_PROXY_DLLS) {
    if (await pathExists(join(profileRoot, proxyName))) {
      hasProxy = true
      break
    }
  }
  
  if (!hasProxy) {
    return `Profile is missing Doorstop proxy DLL (${DOORSTOP_PROXY_DLLS.join(", ")}). This file may have been quarantined by antivirus software.`
  }
  
  // 2. Check for doorstop_config.ini
  const doorstopConfigPath = join(profileRoot, "doorstop_config.ini")
  if (!(await pathExists(doorstopConfigPath))) {
    return "Profile is missing doorstop_config.ini"
  }
  
  // 3. Check for BepInEx/core/*Preloader*.dll
  const coreDir = join(profileRoot, "BepInEx", "core")
  if (!(await pathExists(coreDir))) {
    return "Profile is missing BepInEx/core directory"
  }
  
  const coreEntries = await fs.readdir(coreDir)
  const hasPreloader = coreEntries.some(name => 
    name.toLowerCase().includes("preloader") && name.toLowerCase().endsWith(".dll")
  )
  
  if (!hasPreloader) {
    return "Profile is missing BepInEx Preloader DLL in BepInEx/core/"
  }
  
  return null // All validations passed
}

/**
 * Injects minimal loader files into game install folder
 * Also copies BepInEx folder and updates doorstop_config.ini
 */
async function injectLoaderFiles(
  gameId: string,
  installFolder: string,
  profileRoot: string,
  mode: LaunchMode
): Promise<void> {
  console.log(`[Launcher] Injecting loader files into ${installFolder}`)
  
  // For modded mode, validate that profile has required artifacts
  if (mode === "modded") {
    const validationError = await validateProfileArtifacts(profileRoot)
    if (validationError) {
      throw new Error(validationError)
    }
  }
  
  // Update doorstop config in profile root
  const doorstopConfigPath = join(profileRoot, "doorstop_config.ini")
  await updateDoorstopConfig(doorstopConfigPath, mode)
  
  const filesToInject: Array<{ src: string; dest: string; isDirectory?: boolean }> = []
  
  // Inject Doorstop proxy DLL (find any available)
  for (const proxyName of DOORSTOP_PROXY_DLLS) {
    const proxySrc = join(profileRoot, proxyName)
    if (await pathExists(proxySrc)) {
      filesToInject.push({
        src: proxySrc,
        dest: proxyName,
      })
      break // Only inject the first one we find
    }
  }
  
  // Inject doorstop_config.ini (now properly configured)
  if (await pathExists(doorstopConfigPath)) {
    filesToInject.push({
      src: doorstopConfigPath,
      dest: "doorstop_config.ini",
    })
  }
  
  // Inject any other root Doorstop files (e.g., .doorstop_version)
  const entries = await fs.readdir(profileRoot, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.isFile() && isDoorstopMetadataFile(entry.name)) {
      filesToInject.push({
        src: join(profileRoot, entry.name),
        dest: entry.name,
      })
    }
  }
  
  // Now inject all the files and directories
  if (filesToInject.length > 0) {
    await injectFiles(gameId, installFolder, filesToInject)
  }
}

/**
 * Launches the game
 */
export async function launchGame(options: LaunchOptions): Promise<LaunchResult> {
  const { gameId, profileId, mode, installFolder, exePath, profileRoot, packageIndexUrl } = options
  
  const logger = getLogger()
  logger.info(`Launching game ${gameId} in ${mode} mode`, { profileId, exePath })
  
  try {
    // Step 1: Ensure BepInEx pack is available (Windows only)
    if (process.platform === "win32") {
      const bepInExResult = await ensureBepInExPack(gameId, packageIndexUrl)
      
      if (!bepInExResult.available) {
        logger.error(`BepInEx preparation failed for ${gameId}: ${bepInExResult.error}`)
        return {
          success: false,
          error: bepInExResult.error || "Failed to prepare BepInEx",
        }
      }
      
      logger.debug(`BepInEx pack ready at ${bepInExResult.bootstrapRoot}`)
      
      // Step 2: Copy BepInEx to profile root (idempotent)
      await copyBepInExToProfile(bepInExResult.bootstrapRoot!, profileRoot)
      
      // Step 3: Inject loader files into game install folder
      await injectLoaderFiles(gameId, installFolder, profileRoot, mode)
    } else {
      logger.warn("Launch attempted on non-Windows platform")
      return {
        success: false,
        error: "Launch is only supported on Windows",
      }
    }
    
    // Step 4: Build launch arguments
    const args = await buildLaunchArgs(options.launchParameters)
    
    logger.debug(`Spawning game process: ${exePath}`, { args })
    
    // Step 5: Spawn the game process
    const child = spawn(exePath, args, {
      cwd: installFolder,
      detached: true,
      stdio: "ignore",
    })
    
    // Unref so parent doesn't wait
    child.unref()
    
    const pid = child.pid
    
    if (!pid) {
      logger.error("Failed to get process ID after spawn")
      return {
        success: false,
        error: "Failed to get process ID",
      }
    }
    
    // Step 6: Track the process
    trackProcess(gameId, pid)
    
    logger.info(`Game launched successfully: ${gameId}`, { pid })
    
    return {
      success: true,
      pid,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error(`Launch failed for ${gameId}: ${message}`, { error })
    
    return {
      success: false,
      error: `Launch failed: ${message}`,
    }
  }
}
