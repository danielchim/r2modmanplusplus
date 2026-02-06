/**
 * Data service interfaces.
 *
 * All methods are async – current Zustand implementation wraps synchronous
 * calls in Promises; future DB/tRPC implementation will be natively async.
 *
 * Components should NOT import these interfaces directly – use the hooks
 * from `@/data/hooks` instead.
 */

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

export type ManagedGame = {
  id: string
  isDefault: boolean
  lastAccessedAt: number | null
}

export type { Profile } from "@/store/profile-store"

export type InstalledMod = {
  modId: string
  installedVersion: string
  enabled: boolean
  dependencyWarnings: string[]
}

export type GlobalSettings = {
  // Paths
  dataFolder: string
  steamFolder: string
  modDownloadFolder: string
  cacheFolder: string

  // Downloads
  speedLimitEnabled: boolean
  speedLimitBps: number
  speedUnit: "Bps" | "bps"
  maxConcurrentDownloads: number
  downloadCacheEnabled: boolean
  preferredThunderstoreCdn: string
  autoInstallMods: boolean

  // Mods
  enforceDependencyVersions: boolean

  // UI
  cardDisplayType: "collapsed" | "expanded"
  theme: "dark" | "light" | "system"
  language: string
  funkyMode: boolean
}

export type GameSettings = {
  gameInstallFolder: string
  modDownloadFolder: string
  cacheFolder: string
  modCacheFolder: string
  launchParameters: string
  onlineModListCacheDate: number | null
}

/**
 * GameSettings after merging with GlobalSettings defaults.
 * Every field is guaranteed non-null.
 */
export type EffectiveGameSettings = GameSettings & {
  /** Resolved from per-game → global → default */
  modDownloadFolder: string
  /** Resolved from per-game → global → default */
  cacheFolder: string
}

// ---------------------------------------------------------------------------
// Service interfaces
// ---------------------------------------------------------------------------

export interface IGameService {
  // Queries
  list(): Promise<ManagedGame[]>
  getDefault(): Promise<ManagedGame | null>
  getRecent(limit?: number): Promise<ManagedGame[]>

  // Mutations
  add(gameId: string): Promise<void>
  remove(gameId: string): Promise<string | null>
  setDefault(gameId: string | null): Promise<void>
  touch(gameId: string): Promise<void>
}

export interface ISettingsService {
  // Queries
  getGlobal(): Promise<GlobalSettings>
  getForGame(gameId: string): Promise<GameSettings>
  getEffective(gameId: string): Promise<EffectiveGameSettings>

  // Mutations
  updateGlobal(updates: Partial<GlobalSettings>): Promise<void>
  updateForGame(gameId: string, updates: Partial<GameSettings>): Promise<void>
  resetForGame(gameId: string): Promise<void>
  deleteForGame(gameId: string): Promise<void>
}

export interface IProfileService {
  // Queries
  list(gameId: string): Promise<import("@/store/profile-store").Profile[]>
  getActive(gameId: string): Promise<import("@/store/profile-store").Profile | null>

  // Mutations
  ensureDefault(gameId: string): Promise<string>
  create(gameId: string, name: string): Promise<import("@/store/profile-store").Profile>
  rename(gameId: string, profileId: string, newName: string): Promise<void>
  remove(
    gameId: string,
    profileId: string,
  ): Promise<{ deleted: boolean; reason?: string }>
  setActive(gameId: string, profileId: string): Promise<void>
  reset(gameId: string): Promise<string>
  removeAll(gameId: string): Promise<void>
}

export interface IModService {
  // Queries
  listInstalled(profileId: string): Promise<InstalledMod[]>
  isInstalled(profileId: string, modId: string): Promise<boolean>
  isEnabled(profileId: string, modId: string): Promise<boolean>
  getInstalledVersion(
    profileId: string,
    modId: string,
  ): Promise<string | undefined>
  getDependencyWarnings(
    profileId: string,
    modId: string,
  ): Promise<string[]>

  // Mutations
  install(profileId: string, modId: string, version: string): Promise<void>
  uninstall(profileId: string, modId: string): Promise<void>
  uninstallAll(profileId: string): Promise<number>
  enable(profileId: string, modId: string): Promise<void>
  disable(profileId: string, modId: string): Promise<void>
  toggle(profileId: string, modId: string): Promise<void>
  setDependencyWarnings(
    profileId: string,
    modId: string,
    warnings: string[],
  ): Promise<void>
  clearDependencyWarnings(
    profileId: string,
    modId: string,
  ): Promise<void>
  deleteProfileState(profileId: string): Promise<void>
}
