# Complete End-to-End Modded Launch Flow

This document describes the complete flow from clicking "Start Modded" to launching a modded game in r2modmanPlusPlus.

## Architectural Context

**State Management Migration:** The application is currently migrating from Zustand + localStorage to a SQLite database in the main process. See `docs/architecture-database-migration.md` for complete details.

- **Current State (Transitional):** Game, profile, and mod data may be in Zustand stores (localStorage) or database depending on migration progress
- **Target State:** All persistent data (games, profiles, mods, settings) will be stored in SQLite and accessed via tRPC endpoints
- **Launch System:** The modded launch flow is database-agnostic and works with both architectures. It receives game/profile IDs and paths via tRPC parameters.

## Overview

The modded launch system uses BepInEx with Doorstop injection to load mods into Unity games. The flow involves:
1. Checking and installing base dependencies (BepInEx)
2. Preparing the profile with BepInEx files
3. Injecting minimal loader files into the game directory
4. Launching the game with doorstop configured to load BepInEx

## Stage 1: UI Initiation

**Location:** `src/components/features/game-dashboard.tsx:210-256`

When the user clicks "Start Modded", the `handleStartModded()` function is called:

```typescript
const handleStartModded = async () => {
  // 1. Validate prerequisites
  if (!selectedGameId || !activeProfileId || !binaryVerification.data?.exePath) return

  // 2. Check if base dependencies are installed
  const depsCheck = await trpcUtils.launch.checkBaseDependencies.fetch({
    gameId: selectedGameId,
    profileId: activeProfileId,
  })

  // 3. If BepInEx not installed, show installation dialog
  if (depsCheck.needsInstall) {
    setDepsMissing(depsCheck.missing)
    setInstallDepsOpen(true)
    return
  }

  // 4. Launch the game via tRPC
  const result = await launchMutation.mutateAsync({
    gameId: selectedGameId,
    profileId: activeProfileId,
    mode: "modded",
    installFolder,
    exePath: binaryVerification.data.exePath,
    launchParameters: getPerGameSettings(selectedGameId).launchParameters || "",
    packageIndexUrl,
    modloaderPackage: modloaderPackage || undefined,
  })
}
```

**Key Files:**
- UI Component: `src/components/features/game-dashboard.tsx`
- tRPC Hook: `trpc.launch.start.useMutation()` from `@/lib/trpc`

## Stage 2: Base Dependencies Check

**Location:** `electron/launch/base-dependencies.ts:13-54`

The system checks if BepInEx core files exist in the profile:

```typescript
export async function checkBaseDependencies(profileRoot: string) {
  // Check for:
  // 1. BepInEx/core directory exists
  // 2. Contains a *Preloader*.dll file
  // 3. Doorstop proxy DLL exists (winhttp.dll, version.dll, etc.)
  // 4. doorstop_config.ini exists
}
```

If any component is missing, the user is prompted to install base dependencies.

**Key Files:**
- Implementation: `electron/launch/base-dependencies.ts`
- tRPC Endpoint: `electron/trpc/router.ts:627-640` (checkBaseDependencies)

## Stage 3: BepInEx Installation (If Needed)

**Location:** `electron/launch/base-dependencies.ts:56-170`

When installing base dependencies:

### 3.1: Ensure BepInEx Pack is Available

**Location:** `electron/launch/bepinex-bootstrap.ts:241-334`

```typescript
export async function ensureBepInExPack(
  gameId: string,
  packageIndexUrl: string,
  modloaderPackage?: { owner: string; name: string; rootFolder: string }
) {
  // 1. Find BepInEx pack in Thunderstore catalog
  // 2. Check if already cached in _state/bootstrap directory
  // 3. If not cached, download and extract to bootstrap directory
  // 4. Validate bootstrap contains required files:
  //    - BepInEx/core/*Preloader*.dll
  //    - Doorstop proxy DLL (winhttp.dll, etc.)
  //    - doorstop_config.ini
}
```

The BepInEx pack is cached in `{dataFolder}/{gameId}/_state/bootstrap/{owner}-{name}/{version}/`.

### 3.2: Copy BepInEx to Profile

**Location:** `electron/launch/bepinex-bootstrap.ts:362-393`

```typescript
export async function copyBepInExToProfile(
  bootstrapRoot: string,
  profileRoot: string
) {
  // 1. Copy BepInEx/ folder to profile
  // 2. Copy root doorstop files (winhttp.dll, doorstop_config.ini, etc.)
}
```

This copies the BepInEx framework files into the active profile directory.

**Key Files:**
- Implementation: `electron/launch/bepinex-bootstrap.ts`
- Download Handler: `electron/downloads/downloader.ts`
- Path Resolver: `electron/downloads/path-resolver.ts`

## Stage 4: tRPC Launch Endpoint

**Location:** `electron/trpc/router.ts:573-609`

The tRPC endpoint validates inputs and calls the main launch function:

```typescript
start: publicProcedure
  .input(
    z.object({
      gameId: z.string(),
      profileId: z.string(),
      mode: z.enum(["modded", "vanilla"]),
      installFolder: z.string(),
      exePath: z.string(),
      launchParameters: z.string(),
      packageIndexUrl: z.string(),
      modloaderPackage: z.object({...}).optional(),
    })
  )
  .mutation(async ({ input }) => {
    // Resolve profile root path
    const settings = getPathSettings()
    const paths = resolveGamePaths(input.gameId, settings)
    const profileRoot = `${paths.profilesRoot}/${input.profileId}`

    // Call launcher
    return await launchGame({...input, profileRoot})
  })
```

**Key Files:**
- Router: `electron/trpc/router.ts`

## Stage 5: Main Launch Function

**Location:** `electron/launch/launcher.ts:297-374`

The main `launchGame()` function orchestrates the entire launch:

```typescript
export async function launchGame(options: LaunchOptions): Promise<LaunchResult> {
  // Step 1: Ensure BepInEx pack is available (Windows only)
  const bepInExResult = await ensureBepInExPack(gameId, packageIndexUrl, modloaderPackage)

  // Step 2: Copy BepInEx to profile root (idempotent)
  await copyBepInExToProfile(bepInExResult.bootstrapRoot, profileRoot)

  // Step 3: Inject loader files into game install folder
  await injectLoaderFiles(gameId, installFolder, profileRoot, mode)

  // Step 4: Build launch arguments
  const args = await buildLaunchArgs(options.launchParameters)

  // Step 5: Spawn the game process
  const child = spawn(exePath, args, {
    cwd: installFolder,
    detached: true,
    stdio: "ignore",
  })

  // Step 6: Track the process
  trackProcess(gameId, child.pid)

  return { success: true, pid: child.pid }
}
```

### 5.1: Validate Profile Artifacts

**Location:** `electron/launch/launcher.ts:193-228`

Before injection, the system validates that the profile has all required BepInEx files:

```typescript
async function validateProfileArtifacts(profileRoot: string) {
  // 1. Check for Doorstop proxy DLL (winhttp.dll, version.dll, or winmm.dll)
  // 2. Check for doorstop_config.ini
  // 3. Check for BepInEx/core/*Preloader*.dll

  // Returns error message if any validation fails
  // (e.g., if antivirus quarantined files)
}
```

### 5.2: Update Doorstop Config

**Location:** `electron/launch/launcher.ts:108-170`

The doorstop_config.ini is updated to point to the BepInEx preloader:

```typescript
async function updateDoorstopConfig(
  configPath: string,
  profileRoot: string,
  mode: LaunchMode
) {
  // For modded mode:
  // 1. Find the absolute path to BepInEx.Preloader.dll in profile
  // 2. Set enabled=true
  // 3. Set targetAssembly={absolute path to preloader}

  // For vanilla mode:
  // 1. Set enabled=false

  // Supports both [UnityDoorstop] and [General] config formats
}
```

This is critical: doorstop needs an **absolute path** to the preloader DLL in the profile, so BepInEx can live in the profile while the game lives elsewhere.

### 5.3: Inject Loader Files

**Location:** `electron/launch/launcher.ts:234-292`

Only minimal files are injected into the game directory:

```typescript
async function injectLoaderFiles(
  gameId: string,
  installFolder: string,
  profileRoot: string,
  mode: LaunchMode
) {
  // Files injected:
  // 1. Doorstop proxy DLL (winhttp.dll, version.dll, or winmm.dll)
  // 2. doorstop_config.ini (updated with correct paths)
  // 3. Doorstop metadata files (.doorstop_version, etc.)

  // BepInEx itself stays in the profile!
  // Doorstop loads it via the absolute path in doorstop_config.ini
}
```

The actual file injection is handled by `injectFiles()` from `electron/launch/injection-tracker.ts`.

**Key Files:**
- Main Launcher: `electron/launch/launcher.ts`
- Injection Tracker: `electron/launch/injection-tracker.ts`
- Process Tracker: `electron/launch/process-tracker.ts`

## Stage 6: File Injection System

**Location:** `electron/launch/injection-tracker.ts`

The injection tracker maintains a record of which files were injected into each game directory:

```typescript
export async function injectFiles(
  gameId: string,
  installFolder: string,
  files: Array<{ src: string; dest: string; isDirectory?: boolean }>
) {
  // 1. Load existing injection state from {dataFolder}/_state/injections.json
  // 2. For each file:
  //    a. Copy from src (profile) to dest (game folder)
  //    b. Record in injection state
  // 3. Save updated injection state

  // This allows us to later clean up injected files with cleanupInjected()
}
```

The injection state is a JSON file that tracks:
- Which files were injected into each game
- Source and destination paths
- Timestamps

**Key Files:**
- Injection Tracker: `electron/launch/injection-tracker.ts`
- State File: `{dataFolder}/_state/injections.json`

## Stage 7: Game Process Launch

**Location:** `electron/launch/launcher.ts:337-357`

The game is launched using Node.js `spawn()`:

```typescript
const child = spawn(exePath, args, {
  cwd: installFolder,        // Working directory = game folder
  detached: true,            // Don't wait for game to exit
  stdio: "ignore",           // Don't capture output
})

child.unref()                // Allow parent to exit independently
```

Launch parameters from user settings are passed as command-line arguments.

## Stage 8: Process Tracking

**Location:** `electron/launch/process-tracker.ts:12-32`

The game process is tracked so the UI can show running status:

```typescript
export function trackProcess(gameId: string, pid: number) {
  // 1. Store PID in memory map
  // 2. Periodically check if process is still running
  // 3. Update status in UI via polling
}

export function getProcessStatus(gameId: string) {
  // Returns { running: boolean, pid?: number }
}
```

The UI polls `trpc.launch.getStatus` every 1.5 seconds to update the running indicator.

**Key Files:**
- Process Tracker: `electron/launch/process-tracker.ts`
- tRPC Endpoint: `electron/trpc/router.ts:561-569`

## How Doorstop/BepInEx Works

### Doorstop Injection

1. **Proxy DLL**: `winhttp.dll` (or `version.dll`/`winmm.dll`) is a proxy that intercepts Unity engine calls
2. **Config File**: `doorstop_config.ini` tells doorstop which assembly to load
3. **Target Assembly**: Points to `BepInEx.Preloader.dll` in the profile directory
4. **Injection**: When the game starts, Unity loads the proxy DLL, which reads the config and loads BepInEx

### BepInEx Loading

1. **Preloader**: BepInEx.Preloader.dll hooks into Unity's assembly loading
2. **Core**: Loads BepInEx/core/*.dll files
3. **Plugins**: Scans BepInEx/plugins/ for mod DLLs
4. **Config**: Applies settings from BepInEx/config/*.cfg

### Profile-Based Architecture

**Why BepInEx stays in the profile:**

- Multiple profiles can have different mod configurations
- No need to modify the game installation directly
- Easy to switch between profiles or play vanilla
- Antivirus doesn't scan game folder repeatedly

**How it works:**

- Profile: `{dataFolder}/{gameId}/profiles/{profileId}/`
- Contains: `BepInEx/` folder with all mods and configs
- Game folder: Only has doorstop files (proxy DLL + config)
- Config points to: Absolute path to BepInEx in profile

## Launch Modes

### Modded Mode

- Doorstop enabled: `enabled=true`
- Target assembly: Points to BepInEx.Preloader.dll in profile
- Result: Game loads with all mods from active profile

### Vanilla Mode

- Doorstop disabled: `enabled=false`
- Target assembly: Ignored
- Result: Game loads without any mods

The same doorstop files remain in the game folder; only the config is toggled.

## Error Handling

### Common Failures

1. **Antivirus Quarantine**: Doorstop DLLs flagged as malicious
   - Error: "Profile is missing Doorstop proxy DLL"
   - Solution: Add exception in antivirus, reinstall base dependencies

2. **Missing Game Binary**: Game executable not found
   - Error: "Game binary not found"
   - Solution: Verify game install folder in settings

3. **Corrupt BepInEx**: Bootstrap cache incomplete
   - Error: "Downloaded BepInEx pack is missing required files"
   - Solution: Delete bootstrap cache, redownload

4. **Permissions**: Cannot write to game folder
   - Error: Launch fails silently or with permission denied
   - Solution: Run with appropriate permissions, check folder ownership

### Validation Points

1. **UI**: Binary verification before enabling launch button
2. **Dependencies**: Check BepInEx installed before launch
3. **Profile**: Validate artifacts before injection
4. **Bootstrap**: Validate downloaded BepInEx pack structure

## File Paths Reference

### Profile Structure
```
{dataFolder}/{gameId}/profiles/{profileId}/
├── BepInEx/
│   ├── core/
│   │   └── BepInEx.Preloader.dll
│   ├── plugins/
│   │   └── {author}-{mod}/
│   │       └── *.dll
│   └── config/
│       └── *.cfg
├── doorstop_config.ini
└── winhttp.dll
```

### Bootstrap Cache
```
{dataFolder}/{gameId}/_state/bootstrap/
└── {owner}-{name}/
    └── {version}/
        ├── BepInEx/
        ├── doorstop_config.ini
        └── winhttp.dll
```

### Game Directory (After Injection)
```
{gameInstallFolder}/
├── {GameExe}.exe
├── {GameExe}_Data/
├── doorstop_config.ini (injected)
└── winhttp.dll (injected)
```

### Injection State
```
{dataFolder}/_state/injections.json
{
  "{gameId}": {
    "files": [
      {
        "src": "{profileRoot}/winhttp.dll",
        "dest": "winhttp.dll",
        "injectedAt": 1234567890
      },
      ...
    ]
  }
}
```

## Key Implementation Files

### Frontend (Renderer)
- `src/components/features/game-dashboard.tsx` - Main UI with launch buttons
- `src/lib/trpc.ts` - tRPC client setup
- `src/store/profile-store.ts` - Profile state management (transitioning to database, see `docs/architecture-database-migration.md`)

**Note:** State management is migrating from Zustand + localStorage to SQLite. Profile and game selection may use database-backed tRPC queries (`trpc.profiles.list`, `trpc.games.list`) instead of Zustand stores.

### Backend (Main Process)
- `electron/trpc/router.ts` - tRPC API endpoints
- `electron/launch/launcher.ts` - Main launch orchestration
- `electron/launch/bepinex-bootstrap.ts` - BepInEx download/cache
- `electron/launch/base-dependencies.ts` - Dependency checking
- `electron/launch/injection-tracker.ts` - File injection system
- `electron/launch/process-tracker.ts` - Process monitoring
- `electron/launch/binary-verifier.ts` - Game binary validation

### Supporting Systems
- `electron/downloads/downloader.ts` - HTTP download manager
- `electron/downloads/path-resolver.ts` - Path computation
- `electron/downloads/settings-state.ts` - Settings persistence
- `electron/thunderstore/catalog.ts` - Package catalog
- `electron/profiles/mod-installer.ts` - Mod installation

## Flow Diagram

```
User clicks "Start Modded"
  ↓
[game-dashboard.tsx] handleStartModded()
  ↓
Check base dependencies via tRPC
  ↓
├─ If missing → Show install dialog
│                ↓
│              Install BepInEx
│                ↓
│              [base-dependencies.ts] installBaseDependencies()
│                ↓
│              [bepinex-bootstrap.ts] ensureBepInExPack()
│                ↓
│              Download/cache BepInEx from Thunderstore
│                ↓
│              [bepinex-bootstrap.ts] copyBepInExToProfile()
│                ↓
│              Copy BepInEx to profile directory
│                ↓
└─ Launch via tRPC
     ↓
   [trpc/router.ts] launch.start
     ↓
   [launcher.ts] launchGame()
     ↓
   Ensure BepInEx pack (may download if missing)
     ↓
   Copy BepInEx to profile (idempotent)
     ↓
   [launcher.ts] injectLoaderFiles()
     ↓
   Validate profile artifacts
     ↓
   Update doorstop_config.ini
     ↓
   [injection-tracker.ts] injectFiles()
     ↓
   Copy doorstop files to game folder
     ↓
   [launcher.ts] spawn game process
     ↓
   [process-tracker.ts] trackProcess()
     ↓
   Game running with BepInEx
```

## Platform Support

### Windows (Fully Supported)
- Uses `spawn()` to launch game directly
- Doorstop v4 with proxy DLL injection
- Absolute paths in doorstop_config.ini

### Linux/macOS (Not Implemented)
- Would require Proton compatibility layer
- Different path handling (Z: prefix for Windows paths in Wine)
- Wrapper scripts for Steam integration
- Currently returns error: "Launch is only supported on Windows"

## Future Enhancements

### Possible Improvements
1. **Linux Support**: Proton wrapper scripts and path translation
2. **Steam Integration**: Direct Steam protocol launch instead of spawning .exe
3. **Launch Profiles**: Different launch parameter presets
4. **Pre-launch Scripts**: Run custom scripts before game launch
5. **Post-launch Monitoring**: Watch for crashes, capture logs
6. **Automatic Updates**: Update BepInEx when new versions available

## Testing Checklist

When testing the launch flow:

- [ ] First launch (BepInEx not installed)
- [ ] Base dependencies installation dialog
- [ ] Download progress for BepInEx
- [ ] Launch with mods installed
- [ ] Launch with no mods (empty profile)
- [ ] Vanilla mode launch
- [ ] Switch between profiles and launch
- [ ] Launch with custom parameters
- [ ] Launch with antivirus enabled (test for quarantine)
- [ ] Launch status indicator updates correctly
- [ ] Process tracking shows correct PID
- [ ] Game actually loads with mods
- [ ] Config files persist between launches
- [ ] Cleanup injected files on vanilla launch

## Troubleshooting

### Game Won't Launch

1. Check game binary verification
2. Verify install folder is correct
3. Check for antivirus blocks
4. Review logs at `{userData}/r2modmanplusplus.log`

### Mods Don't Load

1. Verify BepInEx installed (`BepInEx/core/` exists)
2. Check doorstop_config.ini has correct paths
3. Verify doorstop proxy DLL in game folder
4. Check BepInEx log at `{profile}/BepInEx/LogOutput.log`

### Performance Issues

1. Too many mods installed
2. Conflicting mods
3. Outdated BepInEx version
4. Game-specific compatibility issues

## References

- BepInEx Documentation: https://docs.bepinex.dev/
- Doorstop Documentation: https://github.com/NeighTools/UnityDoorstop
- Thunderstore API: https://thunderstore.io/api/docs/
