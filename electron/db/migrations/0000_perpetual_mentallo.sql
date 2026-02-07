CREATE TABLE `game` (
	`id` text PRIMARY KEY NOT NULL,
	`is_default` integer DEFAULT false NOT NULL,
	`last_accessed_at` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `game_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`game_id` text NOT NULL,
	`mod_download_folder` text,
	`cache_folder` text,
	`game_install_folder` text DEFAULT '' NOT NULL,
	`mod_cache_folder` text DEFAULT '' NOT NULL,
	`launch_parameters` text DEFAULT '' NOT NULL,
	`online_mod_list_cache_date` text,
	FOREIGN KEY (`game_id`) REFERENCES `game`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `game_settings_game_id_unique` ON `game_settings` (`game_id`);--> statement-breakpoint
CREATE TABLE `global_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`data_folder` text DEFAULT '' NOT NULL,
	`steam_folder` text DEFAULT '' NOT NULL,
	`mod_download_folder` text DEFAULT '' NOT NULL,
	`cache_folder` text DEFAULT '' NOT NULL,
	`speed_limit_enabled` integer DEFAULT false NOT NULL,
	`speed_limit_bps` integer DEFAULT 0 NOT NULL,
	`speed_unit` text DEFAULT 'Bps' NOT NULL,
	`max_concurrent_downloads` integer DEFAULT 3 NOT NULL,
	`download_cache_enabled` integer DEFAULT true NOT NULL,
	`preferred_thunderstore_cdn` text DEFAULT 'main' NOT NULL,
	`auto_install_mods` integer DEFAULT true NOT NULL,
	`enforce_dependency_versions` integer DEFAULT true NOT NULL,
	`card_display_type` text DEFAULT 'collapsed' NOT NULL,
	`theme` text DEFAULT 'dark' NOT NULL,
	`language` text DEFAULT 'en' NOT NULL,
	`funky_mode` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `profile` (
	`id` text PRIMARY KEY NOT NULL,
	`game_id` text NOT NULL,
	`name` text NOT NULL,
	`is_default` integer DEFAULT false NOT NULL,
	`is_active` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `game`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_profile_game_id` ON `profile` (`game_id`);--> statement-breakpoint
CREATE TABLE `profile_mod` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`profile_id` text NOT NULL,
	`mod_id` text NOT NULL,
	`installed_version` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`dependency_warnings` text,
	FOREIGN KEY (`profile_id`) REFERENCES `profile`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_profile_mod_profile_mod` ON `profile_mod` (`profile_id`,`mod_id`);--> statement-breakpoint
CREATE INDEX `idx_profile_mod_profile_id` ON `profile_mod` (`profile_id`);--> statement-breakpoint
CREATE INDEX `idx_profile_mod_mod_id` ON `profile_mod` (`mod_id`);