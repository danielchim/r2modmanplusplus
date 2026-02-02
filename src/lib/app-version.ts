/**
 * App version information
 * Populated at build time from version.properties
 */

export interface AppBuildInfo {
  version: string
  major: string
  minor: string
  build: string
  revision: string
  mode: "UAT" | "production"
  buildTime: string
}

export interface AppVersion {
  version: string
  mode: "UAT" | "production"
  buildTime: string
  buildInfo?: AppBuildInfo
}

/**
 * Get the app version information
 * Available in both renderer and main process
 */
export function getAppVersion(): AppVersion {
  // In renderer: use import.meta.env (injected by Vite)
  if (typeof window !== "undefined") {
    let buildInfo: AppBuildInfo | undefined
    try {
      const buildInfoStr = import.meta.env.APP_BUILD_INFO
      if (buildInfoStr) {
        buildInfo = typeof buildInfoStr === "string" ? JSON.parse(buildInfoStr) : buildInfoStr
      }
    } catch {
      // Ignore parse errors
    }
    
    return {
      version: import.meta.env.APP_VERSION || "0.0.0",
      mode: (import.meta.env.APP_MODE || "production") as "UAT" | "production",
      buildTime: import.meta.env.APP_BUILD_TIME || new Date().toISOString(),
      buildInfo,
    }
  }

  // In main process: read from package.json
  if (typeof process !== "undefined" && process.env) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const packageJson = require("../../package.json")
      const buildInfo = packageJson.buildInfo || {}
      return {
        version: buildInfo.version || packageJson.version || "0.0.0",
        mode: (buildInfo.mode || "production") as "UAT" | "production",
        buildTime: buildInfo.buildTime || new Date().toISOString(),
        buildInfo: buildInfo as AppBuildInfo | undefined,
      }
    } catch {
      // Fallback if package.json not available
      return {
        version: "0.0.0",
        mode: "production",
        buildTime: new Date().toISOString(),
      }
    }
  }

  // Fallback
  return {
    version: "0.0.0",
    mode: "production",
    buildTime: new Date().toISOString(),
  }
}

/**
 * Get formatted version string
 * Version format: major.minor.revision (build timestamp is metadata, not in version string)
 * e.g., "0.0.1 (UAT)" or "1.2.3"
 */
export function getFormattedVersion(): string {
  const version = getAppVersion()
  const suffix = version.mode === "UAT" ? ` (${version.mode})` : ""
  return `${version.version}${suffix}`
}
