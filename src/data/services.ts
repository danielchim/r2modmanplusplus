/**
 * Service singletons – separated from index.ts to break circular dependency
 * with hooks.ts.
 *
 * Swap the implementation here when migrating from Zustand to DB/tRPC.
 */

import {
  createZustandGameService,
  createZustandSettingsService,
  createZustandProfileService,
  createZustandModService,
} from "./zustand"

export const gameService = createZustandGameService()
export const settingsService = createZustandSettingsService()
export const profileService = createZustandProfileService()
export const modService = createZustandModService()
