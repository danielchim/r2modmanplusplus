import { useTranslation } from "react-i18next"
import { useSettingsData, useSettingsActions } from "@/data"
import { SettingsRow } from "../settings-row"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PanelProps {
  searchQuery: string
}

function formatSpeed(bps: number, unit: "Bps" | "bps", t: (key: string) => string): string {
  if (bps === 0) return t("settings_downloads_unlimited")
  
  const value = unit === "bps" ? bps * 8 : bps
  const units = unit === "bps" 
    ? ["b/s", "kbit/s", "Mbit/s", "Gbit/s"]
    : ["B/s", "KB/s", "MB/s", "GB/s"]
  const divisor = unit === "bps" ? 1000 : 1024
  
  let level = 0
  let formatted = value
  
  while (formatted >= divisor && level < units.length - 1) {
    formatted /= divisor
    level++
  }
  
  return `${formatted.toFixed(level > 0 ? 1 : 0)} ${units[level]}`
}

export function DownloadsPanel(_props: PanelProps) {
  const { t } = useTranslation()
  const { speedLimitEnabled, speedLimitBps, speedUnit, maxConcurrentDownloads, downloadCacheEnabled, autoInstallMods } = useSettingsData().global
  const { updateGlobal } = useSettingsActions()

  // Logarithmic slider mapping (10 KB/s to 200 MB/s)
  const minBps = 10 * 1024 // 10 KB/s
  const maxBps = 200 * 1024 * 1024 // 200 MB/s
  
  const bpsToSlider = (bps: number): number => {
    if (bps <= minBps) return 0
    if (bps >= maxBps) return 1000
    const logMin = Math.log(minBps)
    const logMax = Math.log(maxBps)
    const logValue = Math.log(bps)
    return Math.round(((logValue - logMin) / (logMax - logMin)) * 1000)
  }
  
  const sliderToBps = (slider: number): number => {
    if (slider <= 0) return minBps
    if (slider >= 1000) return maxBps
    const logMin = Math.log(minBps)
    const logMax = Math.log(maxBps)
    const logValue = logMin + (slider / 1000) * (logMax - logMin)
    return Math.round(Math.exp(logValue))
  }

  const handleSpeedLimitChange = (enabled: boolean) => {
    updateGlobal({ speedLimitEnabled: enabled })
  }

  const handleSpeedValueChange = (value: number | number[]) => {
    const numValue = Array.isArray(value) ? value[0] : value
    const bps = sliderToBps(numValue)
    updateGlobal({ speedLimitBps: bps })
  }

  const handleUnitChange = (value: string) => {
    updateGlobal({ speedUnit: value as "Bps" | "bps" })
  }

  const handleConcurrencyChange = (value: string) => {
    updateGlobal({ maxConcurrentDownloads: parseInt(value, 10) })
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">{t("settings_downloads")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("settings_downloads_description")}
        </p>
      </div>

      <div className="space-y-0 divide-y divide-border">
        <SettingsRow
          title={t("settings_downloads_limit_speed_title")}
          description={t("settings_downloads_limit_speed_description")}
          rightContent={
            <Switch
              checked={speedLimitEnabled}
              onCheckedChange={handleSpeedLimitChange}
            />
          }
        />

        {speedLimitEnabled && (
          <SettingsRow
            title={t("settings_downloads_speed_limit_title")}
            description={t("settings_downloads_speed_limit_current", { speed: formatSpeed(speedLimitBps, speedUnit, t) })}
            rightContent={
              <div className="flex items-center gap-4 min-w-[300px]">
                <Slider
                  min={0}
                  max={1000}
                  step={1}
                  value={bpsToSlider(speedLimitBps)}
                  onValueChange={handleSpeedValueChange}
                  disabled={!speedLimitEnabled}
                  className="flex-1"
                />
                <Select value={speedUnit} onValueChange={(value) => value && handleUnitChange(value)}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bps">{t("settings_downloads_bps")}</SelectItem>
                    <SelectItem value="bps">{t("settings_downloads_b_s")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            }
          />
        )}

        <SettingsRow
          title={t("settings_downloads_max_concurrent_title")}
          description={t("settings_downloads_max_concurrent_description")}
          rightContent={
            <Select 
              value={maxConcurrentDownloads.toString()} 
              onValueChange={(value) => value && handleConcurrencyChange(value)}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((n) => (
                  <SelectItem key={n} value={n.toString()}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        />

        <SettingsRow
          title={t("settings_downloads_cache_title")}
          description={t("settings_downloads_cache_description")}
          rightContent={
            <Switch
              checked={downloadCacheEnabled}
              onCheckedChange={(checked) => updateGlobal({ downloadCacheEnabled: checked })}
            />
          }
        />

        <SettingsRow
          title={t("settings_downloads_auto_install_title")}
          description={t("settings_downloads_auto_install_description")}
          rightContent={
            <Switch
              checked={autoInstallMods}
              onCheckedChange={(checked) => updateGlobal({ autoInstallMods: checked })}
            />
          }
        />
      </div>
    </div>
  )
}
