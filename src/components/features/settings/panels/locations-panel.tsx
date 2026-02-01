import { useTranslation } from "react-i18next"
import { useSettingsStore } from "@/store/settings-store"
import { SettingsRow } from "../settings-row"
import { FolderPathControl } from "../folder-path-control"

interface PanelProps {
  searchQuery: string
}

export function LocationsPanel(_props: PanelProps) {
  void _props
  const { t } = useTranslation()
  const dataFolder = useSettingsStore((s) => s.global.dataFolder)
  const steamFolder = useSettingsStore((s) => s.global.steamFolder)
  const modDownloadFolder = useSettingsStore((s) => s.global.modDownloadFolder)
  const cacheFolder = useSettingsStore((s) => s.global.cacheFolder)
  const updateGlobal = useSettingsStore((s) => s.updateGlobal)

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">{t("settings_locations")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("settings_locations_description")}
        </p>
      </div>

      <div className="space-y-0 divide-y divide-border">
        <SettingsRow
          title={t("settings_locations_data_folder_title")}
          description={t("settings_locations_data_folder_description")}
          belowContent={
            <FolderPathControl
              value={dataFolder}
              onChangePath={(nextPath) => updateGlobal({ dataFolder: nextPath })}
              className="w-full"
            />
          }
        />

        <SettingsRow
          title={t("settings_locations_steam_folder_title")}
          description={t("settings_locations_steam_folder_description")}
          belowContent={
            <FolderPathControl
              value={steamFolder}
              onChangePath={(nextPath) => updateGlobal({ steamFolder: nextPath })}
              className="w-full"
            />
          }
        />

        <SettingsRow
          title={t("settings_locations_global_download_title")}
          description={t("settings_locations_global_download_description")}
          belowContent={
            <FolderPathControl
              value={modDownloadFolder}
              placeholder={t("settings_locations_placeholder_not_set_downloads")}
              onChangePath={(nextPath) => updateGlobal({ modDownloadFolder: nextPath })}
              className="w-full"
            />
          }
        />

        <SettingsRow
          title={t("settings_locations_global_cache_title")}
          description={t("settings_locations_global_cache_description")}
          belowContent={
            <FolderPathControl
              value={cacheFolder}
              placeholder={t("settings_locations_placeholder_not_set_cache")}
              onChangePath={(nextPath) => updateGlobal({ cacheFolder: nextPath })}
              className="w-full"
            />
          }
        />
      </div>
    </div>
  )
}
