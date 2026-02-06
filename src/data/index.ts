/**
 * Data layer entry point.
 *
 * Swap the implementation here when migrating from Zustand to DB/tRPC:
 *
 *   - import { createTrpcGameService, ... } from "./trpc"
 *   + export const gameService = createTrpcGameService(trpcClient)
 */

import {
  createZustandGameService,
  createZustandSettingsService,
  createZustandProfileService,
  createZustandModService,
} from "./zustand"

// Service singletons – one swap point for the entire app
export const gameService = createZustandGameService()
export const settingsService = createZustandSettingsService()
export const profileService = createZustandProfileService()
export const modService = createZustandModService()

// Re-export types & interfaces for convenience
export type {
  ManagedGame,
  Profile,
  InstalledMod,
  GlobalSettings,
  GameSettings,
  EffectiveGameSettings,
  IGameService,
  ISettingsService,
  IProfileService,
  IModService,
} from "./interfaces"

// Re-export hooks
export {
  // Game
  useGames,
  useDefaultGame,
  useRecentGames,
  useGameMutations,
  // Settings
  useGlobalSettings,
  useGameSettings,
  useEffectiveGameSettings,
  useSettingsMutations,
  // Profile
  useProfiles,
  useActiveProfile,
  useProfileMutations,
  // Mod
  useInstalledMods,
  useIsModInstalled,
  useIsModEnabled,
  useModMutations,
  // Compound
  useUnmanageGame,
} from "./hooks"
