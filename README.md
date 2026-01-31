# r2modmanPlusPlus (Electron + Vite + shadcn/ui)

This repository powers the r2modmanPlusPlus desktop client, rebuilt on Vite, React, and Tailwind/shadcn/ui for a modern mod management experience. The renderer ships through `electron-vite` alongside a tRPC bridge, Zustand stores, and filesystem helpers so downloads, installations, and profile management stay synchronized between the UI and the Electron main process.

## High-level architecture

- **Renderer** (`src/`): Vite + React + TypeScript + shadcn/ui components. Zustand stores (`@/store/*`) keep UI state serializable/persisted. Hooks (`@/hooks/*`) orchestrate downloads, installs, and mod actions. UI features live in `src/components/features`.
- **Electron main** (`electron/`): Handles downloads, extraction, path resolution, and mod installation in Node land. The renderer invokes these capabilities via a tRPC router (`electron/trpc/router.ts`) that exposes desktop, download, and game/profile mutations/queries.
- **Shared helpers**: `src/lib` and `electron/*` share utilities such as `desktop` helpers (for opening folders) and `fs-utils`.

## Getting started (developer workflow)

1. **Install dependencies**
   ```bash
   pnpm install
   ```
   The workspace prefers `pnpm` because of the included `pnpm-lock.yaml`. It installs both renderer and Electron dependencies.

2. **Dev server + Electron**
   ```bash
   pnpm dev
   ```
   This runs `electron-vite dev` (configured via `package.json`). The renderer is served via Vite while Electron hosts the UI. It automatically rebuilds tRPC types when the main router changes—just restart the dev process if you adjust procedure signatures.

3. **Production build**
   ```bash
   pnpm build
   ```
   Runs TypeScript project references (`tsc -b`) followed by `vite build`. Use this before packaging the Electron app.

4. **Preview**
   ```bash
   pnpm preview
   ```
   Launches a production-like desktop preview using the built assets.

5. **Start editor tools**
   - `pnpm lint` (flat ESLint config) ensures the renderer stays clean.
   - `pnpm -s tsc -b --pretty false` runs the TypeScript project reference build/check. Use this after touching shared types.

## Useful existing flows

- **Downloads**: `electron/downloads/*` handles queueing, extraction, and path resolution.
- **Mod installation**: `electron/profiles/mod-installer.ts` copies extracted files into profile-specific `BepInEx` structures, and the `profiles` tRPC router exposes `installMod`, `uninstallMod`, and `resetProfile`.
- **State syncing**: Renderer hooks like `use-mod-actions.ts` and `use-mod-installer.ts` call tRPC procedures before mutating Zustand so UI state reflects on-disk reality.

## Tips for passengers (future agents)

- Always rebuild the Electron app after touching tRPC routers; stale closures (e.g., “No `mutation`–procedure on path `profiles.installMod`”) are common without `pnpm build` + restart.
- Use `ReadLints` on touched files to catch Tailwind-class warnings or unused imports; the repo prefers Tailwind-style class names like `w-(--anchor-width)` when possible.
- `@/*` path alias points to `src/`, so use those imports within the renderer.
- Undo state-only fixes (e.g., uninstall that only cleared Zustand) by pairing each UI mutation with the main-process file operation. The `UNINSTALL_IMPLEMENTATION_COMPLETE.md` file summarizes the current contract if you need context.
- Remember the workspace rules: prefer `pnpm`, keep ESLint/TS passing, and avoid committing build artifacts.

## Next steps for contributors

- Follow the plan in `UNINSTALL_IMPLEMENTATION_COMPLETE.md` if you need to revisit bulk operations (reset/unmanage/uninstall). That file also has a handy manual verification checklist.
- When adding new UI features, hook into `use-download-actions`, `use-mod-installer`, or `use-mod-actions` to keep lifecycle events consistent.
- If touching downloads/electron paths, ensure `resolveGamePaths` and `settings` helpers stay in sync with `nn` data folder overrides.
