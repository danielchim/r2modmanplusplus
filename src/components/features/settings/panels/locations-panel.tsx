import { useSettingsStore } from "@/store/settings-store"
import { openFolder, selectFolder } from "@/lib/desktop"
import { SettingsRow } from "../settings-row"
import { Button } from "@/components/ui/button"
import { FolderOpen, Folder } from "lucide-react"

interface PanelProps {
  searchQuery: string
}

export function LocationsPanel(_props: PanelProps) {
  const { dataFolder, steamFolder } = useSettingsStore((s) => s.global)
  const updateGlobal = useSettingsStore((s) => s.updateGlobal)

  const handleBrowseDataFolder = () => {
    openFolder(dataFolder)
  }

  const handleChangeDataFolder = async () => {
    const newPath = await selectFolder()
    if (newPath) {
      updateGlobal({ dataFolder: newPath })
    }
  }

  const handleChangeSteamFolder = async () => {
    const newPath = await selectFolder()
    if (newPath) {
      updateGlobal({ steamFolder: newPath })
    }
  }

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
          value={dataFolder}
          rightContent={
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBrowseDataFolder}
              >
                <FolderOpen className="size-4 mr-2" />
                Browse
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleChangeDataFolder}
              >
                <Folder className="size-4 mr-2" />
                Change
              </Button>
            </div>
          }
        />

        <SettingsRow
          title="Steam folder"
          description="The location of the Steam installation folder"
          value={steamFolder}
          rightContent={
            <Button
              variant="outline"
              size="sm"
              onClick={handleChangeSteamFolder}
            >
              <Folder className="size-4 mr-2" />
              Change
            </Button>
          }
        />
      </div>
    </div>
  )
}
