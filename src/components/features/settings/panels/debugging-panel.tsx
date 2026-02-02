import { useState } from "react"
import { useTranslation } from "react-i18next"
import { SettingsRow } from "../settings-row"
import { Button } from "@/components/ui/button"
import { trpc } from "@/lib/trpc"
import { toast } from "sonner"
import { logger } from "@/lib/logger"
import { useAppStore } from "@/store/app-store"
import { getEcosystemEntry } from "@/lib/ecosystem"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function DebuggingPanel() {
  const { t } = useTranslation()
  const [isCopyingLogs, setIsCopyingLogs] = useState(false)
  const [isCopyingInfo, setIsCopyingInfo] = useState(false)
  const [showCacheConfirm, setShowCacheConfirm] = useState(false)
  const [showCatalogConfirm, setShowCatalogConfirm] = useState(false)

  // Queries
  const { data: logFilePath } = trpc.logs.getLogFilePath.useQuery()
  const selectedGameId = useAppStore((s) => s.selectedGameId)

  // Mutations
  const clearAllCacheMutation = trpc.thunderstore.clearAllCache.useMutation()
  const clearCatalogMutation = trpc.thunderstore.clearCatalog.useMutation()

  // Utils for fetching data
  const utils = trpc.useUtils()

  const handleCleanModCache = () => {
    setShowCacheConfirm(true)
  }

  const handleConfirmCleanCache = async () => {
    setShowCacheConfirm(false)
    
    try {
      await clearAllCacheMutation.mutateAsync()
      toast.success("Mod cache cleared successfully")
      logger.info("Mod cache cleared")
    } catch (err) {
      logger.error("Failed to clear mod cache:", err)
      toast.error("Failed to clear mod cache")
    }
  }

  const handleCleanOnlineModList = () => {
    if (!selectedGameId) {
      toast.error("No game selected")
      return
    }
    setShowCatalogConfirm(true)
  }

  const handleConfirmCleanCatalog = async () => {
    setShowCatalogConfirm(false)
    
    if (!selectedGameId) {
      toast.error("No game selected")
      return
    }

    const ecosystem = getEcosystemEntry(selectedGameId)
    const packageIndexUrl = ecosystem?.r2modman?.[0]?.packageIndex

    if (!packageIndexUrl) {
      toast.error("No package index URL found for this game")
      logger.error(`No packageIndex for game: ${selectedGameId}`)
      return
    }

    try {
      await clearCatalogMutation.mutateAsync({ packageIndexUrl })
      toast.success("Online mod list cleared successfully")
      logger.info(`Cleared catalog for: ${packageIndexUrl}`)
    } catch (err) {
      logger.error("Failed to clear online mod list:", err)
      toast.error("Failed to clear online mod list")
    }
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
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCleanModCache}
              disabled={clearAllCacheMutation.isPending}
            >
              {clearAllCacheMutation.isPending ? "Cleaning..." : "Clean Cache"}
            </Button>
          }
        />

        <SettingsRow
          title={t("settings_debugging_clean_online_title")}
          description={t("settings_debugging_clean_online_description")}
          rightContent={
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCleanOnlineModList}
              disabled={!selectedGameId || clearCatalogMutation.isPending}
            >
              {clearCatalogMutation.isPending ? "Cleaning..." : "Clean List"}
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

      {/* Confirmation dialog for clearing mod cache */}
      <AlertDialog open={showCacheConfirm} onOpenChange={setShowCacheConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Mod Cache?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete all deprecated JSON cache files. The cache will be rebuilt automatically when needed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCleanCache}>
              Clear Cache
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation dialog for clearing catalog */}
      <AlertDialog open={showCatalogConfirm} onOpenChange={setShowCatalogConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Online Mod List?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear the SQLite catalog for the current game. The mod list will be rebuilt automatically when you browse mods. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCleanCatalog}>
              Clear List
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
