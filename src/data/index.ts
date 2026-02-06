/**
 * Data layer entry point.
 *
 * Swap the service implementations in services.ts when migrating from
 * Zustand to DB/tRPC.
 */

// Re-export service singletons (for imperative access in non-hook code)
export {
  gameService,
  settingsService,
  profileService,
  modService,
} from "./services"

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

// Re-export hooks + DataBridge
export {
  // Bridge (mount once near app root)
  DataBridge,
  dataKeys,
  // Game Management
  useGameManagementData,
  useGameManagementActions,
  // Settings
  useSettingsData,
  useSettingsActions,
  // Profiles
  useProfileData,
  useProfileActions,
  // Mod Management
  useModManagementData,
  useModManagementActions,
  // Compound
  useUnmanageGame,
} from "./hooks"
