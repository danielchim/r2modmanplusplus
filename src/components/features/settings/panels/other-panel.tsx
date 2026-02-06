import { useMemo } from "react"
import { SettingsRow } from "../settings-row"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useSettingsData, useSettingsActions } from "@/data"
import { useTranslation } from "react-i18next"
import { logger } from "@/lib/logger"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PanelProps {
  searchQuery?: string
}

/** Locale code to i18n key for language name: e.g. "zh-CN" → "language_zh_CN" */
function getLanguageLabelKey(locale: string): string {
  return `language_${locale.replace(/-/g, "_")}`
}

export function OtherPanel(_props: PanelProps) {
  void _props
  const { t, i18n } = useTranslation()

  const { theme, language, cardDisplayType, funkyMode, enforceDependencyVersions } = useSettingsData().global
  const { updateGlobal } = useSettingsActions()

  const availableLanguages = useMemo(
    () => Object.keys(i18n.options.resources ?? {}) as string[],
    [i18n.options.resources]
  )
  const languageLabel = t(getLanguageLabelKey(language))

  const handleRefreshModList = () => {
    // TODO: Implement refresh online mod list
    logger.info("Refreshing online mod list...")
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">{t("settings_appearance_title")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("settings_appearance_description")}
        </p>
      </div>

      <div className="space-y-0 divide-y divide-border">
        <SettingsRow
          title={t("settings_appearance_theme_title")}
          description={t("settings_appearance_theme_description")}
          rightContent={
            <div className="flex gap-2">
              {(["system", "light", "dark"] as const).map((mode) => (
                <Button
                  key={mode}
                  variant={theme === mode ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateGlobal({ theme: mode })}
                  className="capitalize"
                >
                  {mode}
                </Button>
              ))}
            </div>
          }
        />

        <SettingsRow
          title={t("settings_appearance_language_title")}
          description={t("settings_appearance_language_description")}
          rightContent={
            <Select
              value={language}
              onValueChange={(value: string | null) => {
                if (value) updateGlobal({ language: value })
              }}
            >
              <SelectTrigger className="w-[140px]">
                <span className="flex-1 text-left">{languageLabel}</span>
              </SelectTrigger>
              <SelectContent>
                {availableLanguages.map((locale) => (
                  <SelectItem key={locale} value={locale}>
                    {t(getLanguageLabelKey(locale))}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        />

        <SettingsRow
          title={t("settings_appearance_card_display_type_title")}
          description={t("settings_appearance_card_display_type_description")}
          rightContent={
            <Select
              value={cardDisplayType}
              onValueChange={(value: "collapsed" | "expanded" | null) => {
                if (value) updateGlobal({ cardDisplayType: value })
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="collapsed">{t("settings_appearance_card_display_type_collapsed")}</SelectItem>
                <SelectItem value="expanded">{t("settings_appearance_card_display_type_expanded")}</SelectItem>
              </SelectContent>
            </Select>
          }
        />

        <SettingsRow
          title={t("settings_appearance_funky_mode_title")}
          description={t("settings_appearance_funky_mode_description")}
          rightContent={
            <Switch
              checked={funkyMode}
              onCheckedChange={(checked) => updateGlobal({ funkyMode: checked })}
            />
          }
        />

        <SettingsRow
          title={t("settings_appearance_refresh_online_mod_list_title")}
          description={t("settings_appearance_refresh_online_mod_list_description")}
          rightContent={
            <Button variant="outline" size="sm" onClick={handleRefreshModList}>
              {t("settings_appearance_refresh_online_mod_list_action")}
            </Button>
          }
        />
      </div>

      <div className="mt-12 mb-8">
        <h2 className="text-2xl font-semibold mb-2">{t("settings_mod_management_title")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("settings_mod_management_description")}
        </p>
      </div>

      <div className="space-y-0 divide-y divide-border">
        <SettingsRow
          title={t("settings_mod_management_enforce_dependency_versions_title")}
          description={t("settings_mod_management_enforce_dependency_versions_description")}
          rightContent={
            <Switch
              checked={enforceDependencyVersions}
              onCheckedChange={(checked) => updateGlobal({ enforceDependencyVersions: checked })}
            />
          }
        />
      </div>
    </div>
  )
}
