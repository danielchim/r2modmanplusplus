![r2modmanPlusPlus Logo](docs/assets/r2modmanplus_logo.png)

# r2modmanPlusPlus

A modern mod manager desktop application built with Electron, React, and TypeScript. Features a full-stack architecture with tRPC for type-safe IPC, Zustand for state management, and shadcn/ui components for a polished interface.

Huge shoutout to ekbr's ![r2modmanPlus](https://github.com/ebkr/r2modmanPlus/) for inspiration!

## Tech Stack

**Frontend**
- React 19 + TypeScript
- TanStack Router + React Query
- Tailwind CSS v4 + shadcn/ui
- Monaco Editor (YAML support)
- Zustand for state management

**Backend**
- Electron 40
- tRPC for type-safe IPC bridge
- Zod for runtime validation
- SuperJSON for serialization

**Build Tools**
- Vite 7 + electron-vite
- electron-builder for packaging
- TypeScript project references

## Architecture

**Renderer** (`src/`)
- Vite-powered React app with TanStack Router for navigation
- UI components in `src/components/ui/` (shadcn-based)
- Feature modules in `src/components/features/`
- Zustand stores (`@/store/*`) for serializable/persisted state
- Custom hooks (`@/hooks/*`) for downloads, installs, and mod actions
- tRPC client for type-safe main process communication

**Main Process** (`electron/`)
- Handles file system operations, downloads, and extraction
- Manages game profiles and mod installations
- tRPC router (`electron/trpc/router.ts`) exposes procedures for desktop, downloads, and profiles
- Shared utilities for path resolution and filesystem helpers

**Shared**
- `src/lib/` contains utilities shared across renderer
- `electron/*` utilities for main process operations
- Type-safe contracts via tRPC ensure renderer/main stay in sync

## Development

**Prerequisites**
- Node.js (compatible with Electron 40)
- pnpm (workspace uses `pnpm-lock.yaml`)

**Install dependencies**

```bash
pnpm install
```

**Development modes**

Web-only development (faster iteration)

```bash
pnpm dev
```

Runs `vite dev` for web-only development without Electron shell.

Electron development (full desktop app)

```bash
pnpm dev:electron
```

Runs `electron-vite dev` with hot reload for both renderer and main process.

**Building**

Web build

```bash
pnpm build
```

Runs `vite build` for web deployment.

Electron build

```bash
pnpm build:electron
```

Runs `electron-vite build` to compile both renderer and main process.

**Packaging**

Create distributable

```bash
pnpm dist
```

Builds and packages for current platform (Windows NSIS, macOS DMG/ZIP, Linux AppImage).

macOS-specific build

```bash
pnpm dist:mac
```

**Quality checks**

Type checking

```bash
pnpm typecheck
```

Linting

```bash
pnpm lint
```

Preview production build

```bash
pnpm preview          # Web preview
pnpm preview:electron # Electron preview
```

## Project Structure

```
src/
├── components/
│   ├── ui/           # shadcn/ui components (Button, Dialog, etc.)
│   └── features/     # Feature-specific components
├── hooks/            # Custom React hooks (downloads, installs, mod actions)
├── lib/              # Shared utilities
├── store/            # Zustand stores
└── main.tsx          # App entry point

electron/
├── trpc/
│   └── router.ts     # tRPC procedures for IPC
├── downloads/        # Download queue and extraction
└── profiles/         # Mod installation and profile management
```

## Key Workflows

**Downloads**
- `electron/downloads/*` manages download queue, extraction, and path resolution
- Renderer hooks trigger downloads via tRPC procedures
- Progress updates stream back to UI via React Query

**Mod Installation**
- `electron/profiles/mod-installer.ts` copies extracted files into profile-specific `BepInEx` structures
- tRPC router exposes `installMod`, `uninstallMod`, and `resetProfile` procedures
- Renderer hooks (`use-mod-installer.ts`, `use-mod-actions.ts`) keep Zustand state synchronized with filesystem

**State Management**
- Zustand stores provide serializable/persisted state
- tRPC mutations trigger filesystem operations in main process
- React Query caches and invalidates queries automatically
- All UI mutations paired with corresponding main process operations

## Development Guidelines

**Path Aliases**
- Use `@/*` imports for `src/` modules (configured in `vite.config.ts` and `tsconfig.json`)

**tRPC Changes**
- Rebuild Electron app after modifying tRPC routers: `pnpm build:electron`
- Restart dev server to pick up new procedure signatures
- Stale closures cause "No procedure on path" errors

**Code Style**
- Follow ESLint flat config rules (`eslint.config.js`)
- Keep TypeScript strict mode passing
- Use Tailwind utility classes (prefer `w-(--anchor-width)` CSS variable syntax)
- Run `pnpm lint` before committing

**State Synchronization**
- Pair each UI mutation with main process file operation
- Don't mutate Zustand without corresponding tRPC call
- Use React Query invalidation to refresh after mutations

**Build Artifacts**
- Don't commit `dist/`, `out/`, or `release/` directories
- Build info lives in `node_modules/.tmp/` (safe to delete if issues arise)

## Contributing

**Adding Features**
- Hook into existing patterns: `use-download-actions`, `use-mod-installer`, `use-mod-actions`
- Keep lifecycle events consistent across features
- Update tRPC router if new main process capabilities needed

**Electron/Filesystem Changes**
- Ensure `resolveGamePaths` and settings helpers stay synchronized
- Test with various game data folder configurations
- Verify operations work across Windows, macOS, and Linux

**Testing**
- No test runner configured yet (Vitest recommended for future)
- Manual verification checklist available in project docs
- Test both web and Electron modes when changing shared code

## Resources

- [Vite Documentation](https://vite.dev/)
- [Electron Documentation](https://www.electronjs.org/docs)
- [tRPC Documentation](https://trpc.io/)
- [TanStack Router](https://tanstack.com/router)
- [shadcn/ui](https://ui.shadcn.com/)

## License

See project repository for license information.
