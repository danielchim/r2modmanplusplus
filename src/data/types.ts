// Domain types – the canonical frontend shapes.

export type ManagedGame = {
  id: string
  isDefault: boolean
  lastAccessedAt: number | null
}

export type Profile = {
  id: string
  name: string
  createdAt: number
}

export type InstalledMod = {
  modId: string
  installedVersion: string
  enabled: boolean
  dependencyWarnings: string[]
}

export type GlobalSettings = {
  dataFolder: string
  steamFolder: string
  modDownloadFolder: string
  cacheFolder: string
  speedLimitEnabled: boolean
  speedLimitBps: number
  speedUnit: "Bps" | "bps"
  maxConcurrentDownloads: number
  downloadCacheEnabled: boolean
  preferredThunderstoreCdn: string
  autoInstallMods: boolean
  enforceDependencyVersions: boolean
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

export type EffectiveGameSettings = GameSettings & {
  modDownloadFolder: string
  cacheFolder: string
}
