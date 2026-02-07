/**
 * Service singletons – conditionally backed by Zustand or tRPC/DB based on
 * the VITE_DATASOURCE build flag.
 *
 * Vite replaces `import.meta.env.VITE_DATASOURCE` at compile time, so the
 * unused branch is tree-shaken in production builds.
 */

import { isDbMode } from "./datasource"

import {
  createZustandGameService,
  createZustandSettingsService,
  createZustandProfileService,
  createZustandModService,
} from "./zustand"

import {
  createTRPCGameService,
  createTRPCSettingsService,
  createTRPCProfileService,
  createTRPCModService,
} from "./trpc-services"

export const gameService = isDbMode
  ? createTRPCGameService()
  : createZustandGameService()

export const settingsService = isDbMode
  ? createTRPCSettingsService()
  : createZustandSettingsService()

export const profileService = isDbMode
  ? createTRPCProfileService()
  : createZustandProfileService()

export const modService = isDbMode
  ? createTRPCModService()
  : createZustandModService()
