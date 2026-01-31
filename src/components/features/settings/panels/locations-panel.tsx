import { useSettingsStore } from "@/store/settings-store"
import { SettingsRow } from "../settings-row"
import { FolderPathControl } from "../folder-path-control"

interface PanelProps {
  searchQuery: string
}

export function LocationsPanel(_props: PanelProps) {
  void _props
  const dataFolder = useSettingsStore((s) => s.global.dataFolder)
  const steamFolder = useSettingsStore((s) => s.global.steamFolder)
  const modDownloadFolder = useSettingsStore((s) => s.global.modDownloadFolder)
  const cacheFolder = useSettingsStore((s) => s.global.cacheFolder)
  const updateGlobal = useSettingsStore((s) => s.updateGlobal)

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Locations</h2>
        <p className="text-sm text-muted-foreground">
          Manage folder locations and paths for mod storage and game installations
        </p>
      </div>

      <div className="space-y-0 divide-y divide-border">
        <SettingsRow
          title="Data folder"
          description="The folder where mods are stored for all games and profiles"
          belowContent={
            <FolderPathControl
              value={dataFolder}
              onChangePath={(nextPath) => updateGlobal({ dataFolder: nextPath })}
              className="w-full"
            />
          }
        />

        <SettingsRow
          title="Steam folder"
          description="The location of the Steam installation folder"
          belowContent={
            <FolderPathControl
              value={steamFolder}
              onChangePath={(nextPath) => updateGlobal({ steamFolder: nextPath })}
              className="w-full"
            />
          }
        />

        <SettingsRow
          title="Global mod download folder"
          description="Default location for downloaded mod archives across all games. A subfolder for each game will be created automatically. Leave blank to use dataFolder/downloads."
          belowContent={
            <FolderPathControl
              value={modDownloadFolder}
              placeholder="Not set (uses dataFolder/downloads)"
              onChangePath={(nextPath) => updateGlobal({ modDownloadFolder: nextPath })}
              className="w-full"
            />
          }
        />

        <SettingsRow
          title="Global cache folder"
          description="Location for cached data (Thunderstore packages, metadata). Leave blank to use dataFolder/cache."
          belowContent={
            <FolderPathControl
              value={cacheFolder}
              placeholder="Not set (uses dataFolder/cache)"
              onChangePath={(nextPath) => updateGlobal({ cacheFolder: nextPath })}
              className="w-full"
            />
          }
        />
      </div>
    </div>
  )
}
