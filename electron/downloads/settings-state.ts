/**
 * Shared download path settings state for the main process
 * Receives settings from renderer via tRPC and provides them to the download manager
 */
import { app } from "electron"
import type { PathSettings } from "./path-resolver"

/**
 * In-memory settings state (single source of truth for main process)
 */
const pathSettings: PathSettings = {
  global: {
    dataFolder: app.getPath("userData"),
    modDownloadFolder: "",
    cacheFolder: "",
  },
  perGame: {},
}

/**
 * Gets the current path settings
 */
export function getPathSettings(): PathSettings {
  return pathSettings
}

/**
 * Updates path settings (called from tRPC mutation)
 * Sanitizes input to ensure all required fields exist
 */
export function setPathSettings(next: Partial<PathSettings>): void {
  if (next.global) {
    pathSettings.global = {
      dataFolder: next.global.dataFolder ?? pathSettings.global.dataFolder,
      modDownloadFolder: next.global.modDownloadFolder ?? "",
      cacheFolder: next.global.cacheFolder ?? "",
    }
  }
  
  if (next.perGame) {
    pathSettings.perGame = {}
    for (const [gameId, settings] of Object.entries(next.perGame)) {
      pathSettings.perGame[gameId] = {
        modDownloadFolder: settings.modDownloadFolder ?? "",
        cacheFolder: settings.cacheFolder ?? "",
        modCacheFolder: settings.modCacheFolder ?? "",
      }
    }
  }
}
