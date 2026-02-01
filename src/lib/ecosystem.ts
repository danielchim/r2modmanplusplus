import ecosystemData from "@/assets/data/ecosystem.json"

// Minimal types for what we need from ecosystem.json
type EcosystemGame = {
  meta: {
    displayName: string
    iconUrl?: string | null
  } | null
  r2modman: Array<{
    exeNames: string[]
    internalFolderName: string
    gameInstanceType: "game" | "server"
    dataFolderName?: string
    settingsIdentifier?: string
    packageIndex?: string
  }>
}

type ModloaderPackage = {
  packageId: string
  rootFolder: string
  loader: string
}

type EcosystemData = {
  games: Record<string, EcosystemGame>
  modloaderPackages: ModloaderPackage[]
}

const ecosystem = ecosystemData as unknown as EcosystemData

/**
 * Get the full ecosystem entry for a game by its label
 */
export function getEcosystemEntry(label: string): EcosystemGame | null {
  return ecosystem.games[label] || null
}

/**
 * Get the primary r2modman config for a game
 * Prefers entries with gameInstanceType === "game"
 */
function getPrimaryR2modmanConfig(label: string) {
  const entry = getEcosystemEntry(label)
  if (!entry || !entry.r2modman || entry.r2modman.length === 0) {
    return null
  }
  
  // Find first "game" type entry, fallback to first entry
  const gameEntry = entry.r2modman.find((r) => r.gameInstanceType === "game")
  return gameEntry || entry.r2modman[0]
}

/**
 * Get executable names for a game
 */
export function getExeNames(label: string): string[] {
  const config = getPrimaryR2modmanConfig(label)
  return config?.exeNames || []
}

/**
 * Get display name for a game
 */
export function getDisplayName(label: string): string | null {
  const entry = getEcosystemEntry(label)
  return entry?.meta?.displayName || null
}

/**
 * Get all available game labels from ecosystem
 */
export function getAllGameLabels(): string[] {
  return Object.keys(ecosystem.games)
}

/**
 * Check if a game exists in the ecosystem
 */
export function hasGame(label: string): boolean {
  return label in ecosystem.games
}

/**
 * Get the modloader package for a game
 * Returns the package ID, owner, name, and rootFolder
 * 
 * For BepInEx games, this looks up the correct BepInExPack variant
 * (e.g., BepInEx-BepInExPack_H3VR for H3VR, BepInEx-BepInExPack for generic games)
 * 
 * The packageId is checked against the game's package index URL to find the correct variant.
 * Falls back to BepInEx-BepInExPack if no specific variant is found.
 */
export function getModloaderPackageForGame(gameId: string): {
  packageId: string
  owner: string
  name: string
  rootFolder: string
} | null {
  const entry = getEcosystemEntry(gameId)
  if (!entry || !entry.r2modman || entry.r2modman.length === 0) {
    return null
  }
  
  const config = entry.r2modman[0]
  const packageIndexUrl = config.packageIndex
  
  if (!packageIndexUrl) {
    return null
  }
  
  // Extract community identifier from package index URL
  // e.g., "https://thunderstore.io/c/h3vr/api/v1/package-listing-index/" -> "h3vr"
  const communityMatch = packageIndexUrl.match(/thunderstore\.io\/c\/([^/]+)\//)
  const community = communityMatch?.[1]
  
  // Find modloader packages that might match this game
  // For BepInEx games, look for community-specific BepInExPack variants
  // e.g., BepInEx-BepInExPack_H3VR for h3vr community
  const bepinexPackages = ecosystem.modloaderPackages.filter(
    (pkg) => pkg.loader === "bepinex"
  )
  
  // Try to find a community-specific variant first
  // Match patterns like BepInEx-BepInExPack_H3VR, BepInEx-BepInExPack_GTFO, etc.
  if (community) {
    const communityUpper = community.toUpperCase().replace(/-/g, "_")
    const communitySpecific = bepinexPackages.find(
      (pkg) => pkg.packageId.toUpperCase().includes(`_${communityUpper}`)
    )
    
    if (communitySpecific) {
      const [owner, name] = communitySpecific.packageId.split("-")
      return {
        packageId: communitySpecific.packageId,
        owner,
        name,
        rootFolder: communitySpecific.rootFolder,
      }
    }
  }
  
  // Fallback to generic BepInEx-BepInExPack
  const genericPack = bepinexPackages.find(
    (pkg) => pkg.packageId === "BepInEx-BepInExPack"
  )
  
  if (genericPack) {
    const [owner, name] = genericPack.packageId.split("-")
    return {
      packageId: genericPack.packageId,
      owner,
      name,
      rootFolder: genericPack.rootFolder,
    }
  }
  
  return null
}

