/**
 * Data layer entry point.
 *
 * All database access goes through tRPC → Electron main process → SQLite.
 * Query hooks fetch data; mutation hooks modify data and invalidate caches.
 */

// Types
export type {
  ManagedGame,
  Profile,
  InstalledMod,
  GlobalSettings,
  GameSettings,
  EffectiveGameSettings,
} from "./types"

// Query key registry (for advanced cache control)
export { queryKeys } from "./query-keys"

// Vanilla tRPC client (for imperative / non-React code)
export { getClient } from "./trpc-client"

// Query hooks
export {
  useGames,
  useGlobalSettings,
  useGameSettings,
  useAllSettings,
  useProfiles,
  useActiveProfileId,
  useProfileModCounts,
  useInstalledMods,
} from "./queries"

// Mutation hooks
export {
  // Games
  useAddGame,
  useRemoveGame,
  useSetDefaultGame,
  useTouchGame,
  // Settings
  useUpdateGlobalSettings,
  useUpdateGameSettings,
  useResetGameSettings,
  useDeleteGameSettings,
  // Profiles
  useEnsureDefaultProfile,
  useSetActiveProfile,
  useCreateProfile,
  useRenameProfile,
  useDeleteProfile,
  useResetGameProfiles,
  useRemoveGameProfiles,
  // Mods
  useMarkModInstalled,
  useMarkModUninstalled,
  useUninstallAllMods,
  useEnableMod,
  useDisableMod,
  useToggleMod,
  useSetDependencyWarnings,
  useClearDependencyWarnings,
  useDeleteProfileModState,
  // Compound
  useUnmanageGame,
} from "./mutations"
