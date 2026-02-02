import ecosystemData from "@/assets/data/ecosystem.json"

export type EcosystemGame = {
  id: string
  name: string
  iconUrl: string
  bannerUrl: string
}

/**
 * Get the correct path for static assets in both dev and production
 * Uses Vite's BASE_URL which is set to "./" in electron-vite config for production
 */
function getAssetPath(path: string): string {
  // Use import.meta.env.BASE_URL which Vite sets based on the base config
  // With base: "./", BASE_URL will be "./" in production
  const baseUrl = import.meta.env.BASE_URL || "./"
  // Ensure baseUrl ends with / and path doesn't start with /
  const cleanBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`
  const cleanPath = path.startsWith("/") ? path.slice(1) : path
  return `${cleanBase}game_selection/${cleanPath}`
}

/**
 * Parses ecosystem.json and extracts games that should be visible in the game selection UI.
 * Only includes games where at least one r2modman entry has gameSelectionDisplayMode === "visible".
 */
function parseEcosystemGames(): EcosystemGame[] {
  const games: EcosystemGame[] = []

  // The ecosystem.json structure has a "games" object where keys are game IDs
  const gamesData = ecosystemData.games as Record<string, {
    label: string
    meta?: {
      displayName?: string
      iconUrl?: string | null
    }
    r2modman?: Array<{
      gameSelectionDisplayMode?: string
      meta?: {
        displayName?: string
        iconUrl?: string | null
      }
    }> | null
  }>

  for (const [gameId, gameData] of Object.entries(gamesData)) {
    // Check if any r2modman entry has gameSelectionDisplayMode === "visible"
    const hasVisibleMode = gameData.r2modman?.some(
      (entry) => entry.gameSelectionDisplayMode === "visible"
    )

    if (!hasVisibleMode) {
      continue
    }

    // Extract display name (prefer meta.displayName, fallback to label or id)
    const name = gameData.meta?.displayName || gameData.label || gameId

    // Extract icon URL (prefer top-level meta.iconUrl)
    const iconUrl = gameData.meta?.iconUrl || ""

    if (!iconUrl) {
      console.warn(`Game "${gameId}" has no iconUrl in meta, skipping`)
      continue
    }

    games.push({
      id: gameId,
      name,
      iconUrl,
      bannerUrl: getAssetPath(iconUrl)
    })
  }

  // Sort alphabetically by name
  games.sort((a, b) => a.name.localeCompare(b.name))

  return games
}

/**
 * Canonical list of all games that should appear in the Add Game dialog.
 * Sourced from ecosystem.json, filtered to only "visible" games.
 */
export const ECOSYSTEM_GAMES = parseEcosystemGames()
