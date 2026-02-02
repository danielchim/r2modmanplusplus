import { useState } from "react"
import { useTranslation } from "react-i18next"
import { SettingsRow } from "../settings-row"
import { Button } from "@/components/ui/button"
import { trpc } from "@/lib/trpc"
import { toast } from "sonner"
import { logger } from "@/lib/logger"

interface PanelProps {
  searchQuery?: string
}

export function DebuggingPanel(_props: PanelProps) {
  const { t } = useTranslation()
  const [isCopyingLogs, setIsCopyingLogs] = useState(false)
  const [isCopyingInfo, setIsCopyingInfo] = useState(false)

  // Queries
  const { data: logFilePath } = trpc.logs.getLogFilePath.useQuery()

  // Utils for fetching data
  const utils = trpc.useUtils()

  const handleCleanModCache = () => {
    // TODO: Implement mod cache clearing
    toast.info("Mod cache clearing not yet implemented")
    logger.info("Cleaning mod cache...")
  }

  const handleCleanOnlineModList = () => {
    // TODO: Implement this - need to get the active game's packageIndexUrl
    toast.info("Online mod list clearing not yet implemented")
    logger.info("Cleaning online mod list...")
  }

  const handleCopyLogFile = async () => {
    setIsCopyingLogs(true)
    try {
      const logContents = await utils.logs.getFullLogs.fetch()
      await navigator.clipboard.writeText(logContents)
      toast.success("Log file copied to clipboard")
    } catch (err) {
      logger.error("Failed to copy log file:", err)
      toast.error("Failed to copy log file")
    } finally {
      setIsCopyingLogs(false)
    }
  }

  const handleCopyTroubleshootingInfo = async () => {
    setIsCopyingInfo(true)
    try {
      const info = await utils.logs.getTroubleshootingInfo.fetch()
      
      const troubleshootingText = [
        "r2modman++ Troubleshooting Information",
        "========================================",
        "",
        `App Name: ${info.appName}`,
        `App Version: ${info.appVersion}`,
        `Platform: ${info.platform} (${info.arch})`,
        `Electron Version: ${info.electronVersion}`,
        `Chrome Version: ${info.chromeVersion}`,
        `Node Version: ${info.nodeVersion}`,
        "",
        `User Data Path: ${info.userDataPath}`,
        `Logs Path: ${info.logsPath}`,
        "",
        `Timestamp: ${info.timestamp}`,
      ].join("\n")

      await navigator.clipboard.writeText(troubleshootingText)
      toast.success("Troubleshooting info copied to clipboard")
    } catch (err) {
      logger.error("Failed to copy troubleshooting info:", err)
      toast.error("Failed to copy troubleshooting info")
    } finally {
      setIsCopyingInfo(false)
    }
  }

  const handleOpenLogFolder = () => {
    if (logFilePath) {
      // Extract directory from file path
      const logDir = logFilePath.substring(0, logFilePath.lastIndexOf("\\") || logFilePath.lastIndexOf("/"))
      window.electron?.openFolder(logDir)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">{t("settings_debugging")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("settings_debugging_description")}
        </p>
      </div>

      <div className="space-y-0 divide-y divide-border">
        <SettingsRow
          title={t("settings_debugging_clean_cache_title")}
          description={t("settings_debugging_clean_cache_description")}
          rightContent={
            <Button variant="outline" size="sm" onClick={handleCleanModCache}>
              Clean Cache
            </Button>
          }
        />

        <SettingsRow
          title={t("settings_debugging_clean_online_title")}
          description={t("settings_debugging_clean_online_description")}
          rightContent={
            <Button variant="outline" size="sm" onClick={handleCleanOnlineModList}>
              Clean List
            </Button>
          }
        />

        <SettingsRow
          title={t("settings_debugging_copy_log_title")}
          description={t("settings_debugging_copy_log_description")}
          rightContent={
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopyLogFile}
                disabled={isCopyingLogs}
              >
                {isCopyingLogs ? t("settings_debugging_copy_log_copying") : t("settings_debugging_copy_log_button")}
              </Button>
              {logFilePath && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleOpenLogFolder}
                >
                  Open Folder
                </Button>
              )}
            </div>
          }
        />

        <SettingsRow
          title={t("settings_debugging_copy_info_title")}
          description={t("settings_debugging_copy_info_description")}
          rightContent={
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopyTroubleshootingInfo}
              disabled={isCopyingInfo}
            >
              {isCopyingInfo ? t("settings_debugging_copy_info_copying") : t("settings_debugging_copy_info_button")}
            </Button>
          }
        />
      </div>
    </div>
  )
}
