# r2modmanPlusPlus Documentation

This directory contains technical documentation for r2modmanPlusPlus.

## Modded Launch System

The modded launch system enables users to launch games with BepInEx mod loader injection.

### Documentation Files

#### [MODDED_LAUNCH_FLOW.md](./MODDED_LAUNCH_FLOW.md)
**Complete technical documentation of the modded launch system.**

- Detailed stage-by-stage breakdown
- Code snippets with file references
- Architecture explanation (Doorstop, BepInEx, profiles)
- File path structures and diagrams
- Error handling patterns
- Platform support details

**Read this to:** Understand how the entire system works from clicking "Start Modded" to launching the game.

#### [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)
**Implementation verification and testing guide.**

- Stage-by-stage implementation status (all ✅ complete)
- Architecture validation
- Manual testing checklist
- Known issues and next steps
- Deployment readiness assessment

**Read this to:** Verify implementation completeness and prepare for testing/deployment.

#### [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
**Practical developer and user guide.**

- API usage examples (React + Electron)
- User troubleshooting guide
- File location reference
- Common patterns and best practices
- Extension points for customization

**Read this to:** Learn how to use the launch API or troubleshoot issues.

## Quick Links

### For New Developers

1. Start with [MODDED_LAUNCH_FLOW.md](./MODDED_LAUNCH_FLOW.md) to understand the architecture
2. Review [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) to see what's implemented
3. Use [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for API examples

### For Testing

1. Check [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) for testing checklist
2. Review [MODDED_LAUNCH_FLOW.md](./MODDED_LAUNCH_FLOW.md) for expected behavior
3. Use [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for troubleshooting

### For Users

1. See [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) "For Users" section
2. Check "Troubleshooting" section for common issues

## Key Concepts

### Modded Launch Flow

```
User clicks "Start Modded"
  ↓
Check if BepInEx installed
  ↓
Download BepInEx if needed
  ↓
Copy BepInEx to profile
  ↓
Inject doorstop files to game folder
  ↓
Update doorstop config with profile paths
  ↓
Spawn game process
  ↓
Track process status
  ↓
Game loads with mods from profile
```

### Profile-Based Architecture

- **Profile:** `{dataFolder}/{gameId}/profiles/{profileId}/`
  - Contains: Full BepInEx installation + mods + configs
  - Benefit: Multiple profiles, easy switching

- **Game Folder:** Only doorstop files (proxy DLL + config)
  - Why: Minimal game modification, antivirus-friendly
  - Config points to: Absolute path to BepInEx in profile

### BepInEx + Doorstop

- **Doorstop:** DLL proxy that hooks Unity engine startup
- **BepInEx:** Mod framework that loads mods
- **Flow:** Game → Doorstop → BepInEx → Mods

## File Structure

```
electron/launch/
├── launcher.ts              ← Main launch orchestration
├── bepinex-bootstrap.ts     ← BepInEx download/cache
├── base-dependencies.ts     ← Dependency checking
├── injection-tracker.ts     ← File injection system
├── process-tracker.ts       ← Process monitoring
└── binary-verifier.ts       ← Game executable validation

src/components/features/
└── game-dashboard.tsx       ← Launch UI (Start Modded button)

electron/trpc/
└── router.ts                ← Launch API endpoints
```

## Common Operations

### Launch Modded Game

```typescript
const result = await trpc.launch.start.mutate({
  gameId: "risk-of-rain-2",
  profileId: "risk-of-rain-2-default",
  mode: "modded",
  installFolder: "C:/Games/RiskOfRain2",
  exePath: "C:/Games/RiskOfRain2/Risk of Rain 2.exe",
  launchParameters: "",
  packageIndexUrl: "https://thunderstore.io/c/riskofrain2/api/v1/package/",
  profileRoot: profileRoot,
  modloaderPackage: { owner: "BepInEx", name: "BepInExPack", rootFolder: "BepInExPack" }
})
```

### Check Dependencies

```typescript
const depsCheck = await trpc.launch.checkBaseDependencies.fetch({
  gameId: "risk-of-rain-2",
  profileId: "risk-of-rain-2-default"
})

if (depsCheck.needsInstall) {
  // Show install dialog
}
```

### Get Launch Status

```typescript
const status = trpc.launch.getStatus.useQuery(
  { gameId: "risk-of-rain-2" },
  { refetchInterval: 1500 }
)

const isRunning = status.data?.running
const pid = status.data?.pid
```

## Troubleshooting

### Game Won't Launch

1. Check install folder is correct
2. Verify game executable exists
3. Check antivirus hasn't quarantined doorstop DLLs
4. Review logs at `{dataFolder}/r2modmanplusplus.log`

### Mods Don't Load

1. Verify BepInEx installed (check `BepInEx/core/` exists)
2. Check doorstop_config.ini has correct paths
3. Verify doorstop proxy DLL in game folder
4. Check BepInEx log at `{profile}/BepInEx/LogOutput.log`

### "Launch is only supported on Windows"

Linux/macOS support not yet implemented. Requires Proton integration.

## Contributing

When contributing to the launch system:

1. Read all three documentation files
2. Follow existing patterns (see QUICK_REFERENCE.md)
3. Add tests for new functionality
4. Update documentation
5. Test on real games before submitting PR

## Additional Documentation

- **ELECTRON_MIGRATION_PROGRESS.md** - Electron migration status
- **AGENTS.md** - Agent instructions for development

## Support

- **GitHub Issues:** https://github.com/danielchim/r2modmanplusplus/issues
- **Technical Questions:** Review documentation first, then create issue
