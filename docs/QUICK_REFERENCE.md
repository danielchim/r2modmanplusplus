# Quick Reference: Modded Launch System

## For Developers

### Adding a New Game

To add support for a new game with modded launch:

1. **Add game to ecosystem** (`src/lib/ecosystem-games.ts`):
```typescript
{
  id: "your-game-id",
  displayName: "Your Game Name",
  exeNames: ["YourGame.exe", "game.exe"],  // Possible executable names
  r2modman: [{
    packageIndex: "https://thunderstore.io/c/your-game/api/v1/package/",
  }],
  modloaderPackage: {
    owner: "BepInEx",
    name: "BepInExPack",       // Or game-specific variant
    rootFolder: "BepInExPack"
  }
}
```

2. **That's it!** The launch system will:
   - Auto-detect the game executable
   - Download the correct BepInEx variant
   - Configure doorstop automatically
   - Handle profile management

### Calling the Launch API

#### From React Components

```typescript
import { trpc } from "@/lib/trpc"

const MyComponent = () => {
  const launchMutation = trpc.launch.start.useMutation()

  const handleLaunch = async () => {
    const result = await launchMutation.mutateAsync({
      gameId: "risk-of-rain-2",
      profileId: "risk-of-rain-2-default",
      mode: "modded",  // or "vanilla"
      installFolder: "C:/Games/RiskOfRain2",
      exePath: "C:/Games/RiskOfRain2/Risk of Rain 2.exe",
      launchParameters: "--some-arg",
      packageIndexUrl: "https://thunderstore.io/c/riskofrain2/api/v1/package/",
      modloaderPackage: {
        owner: "BepInEx",
        name: "BepInExPack",
        rootFolder: "BepInExPack"
      }
    })

    if (result.success) {
      console.log(`Game launched with PID ${result.pid}`)
    } else {
      console.error(`Launch failed: ${result.error}`)
    }
  }

  return <button onClick={handleLaunch}>Launch</button>
}
```

#### Checking Launch Status

```typescript
const statusQuery = trpc.launch.getStatus.useQuery(
  { gameId: "risk-of-rain-2" },
  { refetchInterval: 1500 }  // Poll every 1.5 seconds
)

const isRunning = statusQuery.data?.running ?? false
const pid = statusQuery.data?.pid
```

#### Checking Base Dependencies

```typescript
const depsCheck = await trpcUtils.launch.checkBaseDependencies.fetch({
  gameId: "risk-of-rain-2",
  profileId: "risk-of-rain-2-default",
})

if (depsCheck.needsInstall) {
  console.log("Missing:", depsCheck.missing)
  // Show install dialog
}
```

#### Installing Base Dependencies

```typescript
const installMutation = trpc.launch.installBaseDependencies.useMutation()

const result = await installMutation.mutateAsync({
  gameId: "risk-of-rain-2",
  profileId: "risk-of-rain-2-default",
  packageIndexUrl: "https://thunderstore.io/c/riskofrain2/api/v1/package/",
  modloaderPackage: {
    owner: "BepInEx",
    name: "BepInExPack",
    rootFolder: "BepInExPack"
  }
})

if (result.success) {
  console.log(`Installed ${result.filesInstalled} components`)
}
```

### From Electron Main Process

```typescript
import { launchGame } from "./electron/launch/launcher"
import { checkBaseDependencies } from "./electron/launch/base-dependencies"

// Check dependencies
const depsCheck = await checkBaseDependencies(profileRoot)
if (depsCheck.needsInstall) {
  // Install first
}

// Launch
const result = await launchGame({
  gameId: "risk-of-rain-2",
  profileId: "risk-of-rain-2-default",
  mode: "modded",
  installFolder: "C:/Games/RiskOfRain2",
  exePath: "C:/Games/RiskOfRain2/Risk of Rain 2.exe",
  launchParameters: "",
  packageIndexUrl: "https://thunderstore.io/c/riskofrain2/api/v1/package/",
  profileRoot: "C:/Users/User/AppData/Roaming/r2modmanplusplus/risk-of-rain-2/profiles/default",
  modloaderPackage: {
    owner: "BepInEx",
    name: "BepInExPack",
    rootFolder: "BepInExPack"
  }
})
```

## For Users

### First Time Setup

1. **Add a game** in settings:
   - Click gear icon
   - Go to "Games" tab
   - Set game install folder

2. **Launch modded**:
   - Click "Start Modded"
   - First time: Downloads BepInEx (~5MB)
   - Installs to profile
   - Launches game

3. **Install mods**:
   - Browse "Online Mods"
   - Click download on any mod
   - Mod installs to active profile
   - Launch to play with mods

### Troubleshooting

#### Game Won't Launch

**Check install folder:**
- Settings → Games → [Your Game] → Install Folder
- Should point to folder containing .exe

**Check binary detection:**
- Green checkmark should appear when folder is valid
- Hover over launch button to see error

**Check antivirus:**
- BepInEx DLLs may be quarantined
- Add exception for r2modmanplusplus data folder
- Reinstall base dependencies

#### Mods Don't Load

**Check BepInEx installed:**
- Click "Start Modded"
- Should prompt to install if missing
- Check profile folder has BepInEx/ directory

**Check doorstop config:**
- Profile folder should have doorstop_config.ini
- Should have enabled=true for modded
- Should have absolute path to preloader

**Check game folder:**
- Game folder should have winhttp.dll (or version.dll)
- Game folder should have doorstop_config.ini
- These are automatically injected

#### "Launch is only supported on Windows"

- Currently, only Windows is supported
- Linux/macOS require Proton integration (not yet implemented)

### Advanced Usage

#### Custom Launch Parameters

Settings → Games → [Your Game] → Launch Parameters

Examples:
```
-windowed -screen-width 1920 -screen-height 1080
--skipIntro --debugMode
```

#### Multiple Profiles

1. Click profile dropdown
2. Click "Create New Profile"
3. Each profile has own mods/config
4. Switch profiles before launching

#### Vanilla Mode

- Click "Start Vanilla" to play without mods
- Doorstop is disabled automatically
- Mods not loaded
- Saves in same location

#### Manual Mod Installation

- Not yet implemented
- Use "Import Local Mod" when available

## File Locations

### User Data Folder
**Windows:** `C:\Users\[Username]\AppData\Roaming\r2modmanplusplus\`
**Linux:** `~/.config/r2modmanplusplus/` (not supported yet)
**macOS:** `~/Library/Application Support/r2modmanplusplus/` (not supported yet)

### Profile Structure
```
{dataFolder}/{gameId}/profiles/{profileId}/
├── BepInEx/
│   ├── core/              ← BepInEx core files
│   ├── plugins/           ← Your mods
│   │   └── Author-ModName/
│   │       └── ModName.dll
│   ├── config/            ← Mod configs
│   │   └── ModConfig.cfg
│   └── patchers/          ← Preloader patches
├── doorstop_config.ini    ← Doorstop configuration
└── winhttp.dll           ← Doorstop proxy
```

### Bootstrap Cache
```
{dataFolder}/{gameId}/_state/bootstrap/
└── BepInEx-BepInExPack/
    └── 5.4.2300/          ← Cached BepInEx version
        ├── BepInEx/
        ├── doorstop_config.ini
        └── winhttp.dll
```

### Logs

**App Log:** `{dataFolder}/r2modmanplusplus.log`
**BepInEx Log:** `{profileRoot}/BepInEx/LogOutput.log` (after first launch)

## Common Patterns

### Safe Launch Flow

```typescript
// 1. Verify binary
const binaryCheck = await trpc.launch.verifyBinary.query({
  installFolder,
  exeNames: ["Game.exe"]
})

if (!binaryCheck.ok) {
  alert("Game not found")
  return
}

// 2. Check dependencies
const depsCheck = await trpc.launch.checkBaseDependencies.fetch({
  gameId,
  profileId
})

if (depsCheck.needsInstall) {
  // Show install dialog
  const installResult = await trpc.launch.installBaseDependencies.mutate({
    gameId,
    profileId,
    packageIndexUrl,
    modloaderPackage
  })

  if (!installResult.success) {
    alert(`Installation failed: ${installResult.error}`)
    return
  }
}

// 3. Launch
const launchResult = await trpc.launch.start.mutate({
  gameId,
  profileId,
  mode: "modded",
  installFolder,
  exePath: binaryCheck.exePath,
  launchParameters,
  packageIndexUrl,
  modloaderPackage
})

if (launchResult.success) {
  console.log(`Launched with PID ${launchResult.pid}`)
} else {
  alert(`Launch failed: ${launchResult.error}`)
}
```

### Cleanup Injected Files

```typescript
// Remove doorstop files from game folder
await trpc.launch.cleanupInjected.mutate({
  gameId: "risk-of-rain-2"
})
```

Useful for:
- Switching to vanilla permanently
- Cleaning up before uninstall
- Troubleshooting injection issues

## Extension Points

### Custom Mod Loaders

To support a mod loader other than BepInEx:

1. Create bootstrap module (like `bepinex-bootstrap.ts`)
2. Implement installation function
3. Update `launchGame()` to call your bootstrap
4. Add to game ecosystem config

### Custom Launch Methods

To support Steam protocol or other launchers:

1. Create launcher module (like `steam-launcher.ts`)
2. Implement `spawn()` alternative
3. Update `launchGame()` to use your launcher
4. Handle platform-specific arguments

### Platform Support

To add Linux/macOS support:

1. Add Proton path resolution
2. Implement Wine prefix handling
3. Add Z: drive mapping
4. Create wrapper scripts
5. Update `launchGame()` platform check

## API Reference

See `docs/MODDED_LAUNCH_FLOW.md` for detailed API documentation.

### Launch Options

```typescript
interface LaunchOptions {
  gameId: string                    // Unique game identifier
  profileId: string                 // Active profile ID
  mode: "modded" | "vanilla"        // Launch mode
  installFolder: string             // Game installation folder
  exePath: string                   // Full path to game executable
  launchParameters: string          // Custom launch arguments
  packageIndexUrl: string           // Thunderstore API URL
  profileRoot: string               // Profile directory path
  modloaderPackage?: {
    owner: string                   // Package owner (e.g., "BepInEx")
    name: string                    // Package name (e.g., "BepInExPack")
    rootFolder: string              // Root folder in zip
  }
}
```

### Launch Result

```typescript
interface LaunchResult {
  success: boolean      // Whether launch succeeded
  pid?: number         // Process ID if successful
  error?: string       // Error message if failed
}
```

## Best Practices

### Error Handling

✅ **Do:**
```typescript
try {
  const result = await launchMutation.mutateAsync(options)
  if (!result.success) {
    toast.error("Launch failed", { description: result.error })
  }
} catch (error) {
  toast.error("Launch failed", {
    description: error instanceof Error ? error.message : "Unknown error"
  })
}
```

❌ **Don't:**
```typescript
const result = await launchMutation.mutateAsync(options)
// No error handling - will crash on network error
```

### Status Polling

✅ **Do:**
```typescript
const status = trpc.launch.getStatus.useQuery(
  { gameId },
  {
    refetchInterval: 1500,  // Poll every 1.5 seconds
    enabled: !!gameId       // Only poll when gameId exists
  }
)
```

❌ **Don't:**
```typescript
setInterval(async () => {
  const status = await fetch("/api/launch/status")
  // Manual polling - use React Query instead
}, 100)  // Too frequent
```

### Path Handling

✅ **Do:**
```typescript
import { join } from "path"
const profileRoot = join(dataFolder, gameId, "profiles", profileId)
```

❌ **Don't:**
```typescript
const profileRoot = `${dataFolder}/${gameId}/profiles/${profileId}`
// String concatenation - breaks on Windows
```

## Support

- Technical Docs: `docs/MODDED_LAUNCH_FLOW.md`
- Implementation Status: `docs/IMPLEMENTATION_STATUS.md`
- GitHub Issues: https://github.com/danielchim/r2modmanplusplus/issues
