/**
 * App version information
 * Populated at build time via vite-plugin-version
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
 * Available in both renderer and main process via Vite's define
 */
export function getAppVersion(): AppVersion {
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
