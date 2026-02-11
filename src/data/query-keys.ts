/**
 * Centralized query key definitions.
 *
 * Invalidating a "root" key invalidates all queries that start with that prefix
 * (React Query matches by prefix).
 *
 * "disabled" keys are used when a hook receives `null` — they must NOT collide
 * with any real key so that invalidation of `root` doesn't trigger useless fetches.
 */
export const queryKeys = {
  games: {
    root: ["games"] as const,
    list: ["games", "list"] as const,
  },
  settings: {
    root: ["settings"] as const,
    global: ["settings", "global"] as const,
    game: (gameId: string) => ["settings", "game", gameId] as const,
    gameDisabled: ["settings", "game", "__disabled__"] as const,
    all: ["settings", "all"] as const,
  },
  profiles: {
    root: ["profiles"] as const,
    list: (gameId: string) => ["profiles", "list", gameId] as const,
    listDisabled: ["profiles", "list", "__disabled__"] as const,
    active: (gameId: string) => ["profiles", "active", gameId] as const,
    activeDisabled: ["profiles", "active", "__disabled__"] as const,
  },
  mods: {
    root: ["mods"] as const,
    counts: (gameId: string) => ["mods", "counts", gameId] as const,
    countsDisabled: ["mods", "counts", "__disabled__"] as const,
    installed: (profileId: string) => ["mods", "installed", profileId] as const,
    installedDisabled: ["mods", "installed", "__disabled__"] as const,
  },
}
