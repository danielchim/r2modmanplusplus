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

type EcosystemData = {
  games: Record<string, EcosystemGame>
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
