import { sqliteTable, text, integer, uniqueIndex, index } from "drizzle-orm/sqlite-core"

// ── GlobalSettings（单例，id 固定 = 1） ──────────────────────────────
export const globalSettings = sqliteTable("global_settings", {
  id: integer("id").primaryKey().$default(() => 1),

  // 路径
  dataFolder: text("data_folder").notNull().default(""),
  steamFolder: text("steam_folder").notNull().default(""),
  modDownloadFolder: text("mod_download_folder").notNull().default(""),
  cacheFolder: text("cache_folder").notNull().default(""),

  // 下载
  speedLimitEnabled: integer("speed_limit_enabled", { mode: "boolean" }).notNull().default(false),
  speedLimitBps: integer("speed_limit_bps").notNull().default(0),
  speedUnit: text("speed_unit").notNull().default("Bps"), // "Bps" | "bps"
  maxConcurrentDownloads: integer("max_concurrent_downloads").notNull().default(3),
  downloadCacheEnabled: integer("download_cache_enabled", { mode: "boolean" }).notNull().default(true),
  preferredThunderstoreCdn: text("preferred_thunderstore_cdn").notNull().default("main"),
  autoInstallMods: integer("auto_install_mods", { mode: "boolean" }).notNull().default(true),

  // Mod
  enforceDependencyVersions: integer("enforce_dependency_versions", { mode: "boolean" }).notNull().default(true),

  // UI
  cardDisplayType: text("card_display_type").notNull().default("collapsed"), // "collapsed" | "expanded"
  theme: text("theme").notNull().default("dark"), // "dark" | "light" | "system"
  language: text("language").notNull().default("en"),
  funkyMode: integer("funky_mode", { mode: "boolean" }).notNull().default(false),
})

// ── Game（用户管理的游戏） ───────────────────────────────────────────
export const game = sqliteTable("game", {
  id: text("id").primaryKey(), // Thunderstore community identifier
  isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
  lastAccessedAt: text("last_accessed_at"), // ISO8601
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
})

// ── GameSettings（per-game 覆盖，nullable = 继承 global） ───────────
export const gameSettings = sqliteTable("game_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  gameId: text("game_id").notNull().unique().references(() => game.id, { onDelete: "cascade" }),

  // 可覆盖全局的（nullable → fallback to global）
  modDownloadFolder: text("mod_download_folder"),
  cacheFolder: text("cache_folder"),

  // 仅 per-game
  gameInstallFolder: text("game_install_folder").notNull().default(""),
  modCacheFolder: text("mod_cache_folder").notNull().default(""),
  launchParameters: text("launch_parameters").notNull().default(""),
  onlineModListCacheDate: text("online_mod_list_cache_date"), // ISO8601 | null
})

// ── Profile ─────────────────────────────────────────────────────────
export const profile = sqliteTable("profile", {
  id: text("id").primaryKey(), // "{gameId}-{uuid}" or "{gameId}-default"
  gameId: text("game_id").notNull().references(() => game.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
}, (table) => [
  index("idx_profile_game_id").on(table.gameId),
])

// ── ProfileMod（per-profile 的 mod 安装记录） ────────────────────────
export const profileMod = sqliteTable("profile_mod", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  profileId: text("profile_id").notNull().references(() => profile.id, { onDelete: "cascade" }),
  modId: text("mod_id").notNull(), // Thunderstore full_name "Author-ModName"
  installedVersion: text("installed_version").notNull(),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  dependencyWarnings: text("dependency_warnings"), // JSON array string | null
}, (table) => [
  uniqueIndex("uq_profile_mod_profile_mod").on(table.profileId, table.modId),
  index("idx_profile_mod_profile_id").on(table.profileId),
  index("idx_profile_mod_mod_id").on(table.modId),
])
