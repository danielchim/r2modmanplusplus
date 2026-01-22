import ecosystemData from "@/assets/data/ecosystem.json"

export type EcosystemGame = {
  id: string
  name: string
  iconUrl: string
  bannerUrl: string
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
      bannerUrl: `/game_selection/${iconUrl}`
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
