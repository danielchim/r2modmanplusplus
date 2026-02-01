import { useState } from "react"
import { SettingsRow } from "../settings-row"
import { Button } from "@/components/ui/button"
import { trpc } from "@/lib/trpc"
import { toast } from "sonner"

interface PanelProps {
  searchQuery?: string
}

export function DebuggingPanel(_props: PanelProps) {
  const [isCopyingLogs, setIsCopyingLogs] = useState(false)
  const [isCopyingInfo, setIsCopyingInfo] = useState(false)

  // Queries
  const { data: logFilePath } = trpc.logs.getLogFilePath.useQuery()

  // Utils for fetching data
  const utils = trpc.useUtils()

  const handleCleanModCache = () => {
    // TODO: Implement mod cache clearing
    toast.info("Mod cache clearing not yet implemented")
    console.log("Cleaning mod cache...")
  }

  const handleCleanOnlineModList = () => {
    // TODO: Implement this - need to get the active game's packageIndexUrl
    toast.info("Online mod list clearing not yet implemented")
    console.log("Cleaning online mod list...")
  }

  const handleCopyLogFile = async () => {
    setIsCopyingLogs(true)
    try {
      const logContents = await utils.logs.getFullLogs.fetch()
      await navigator.clipboard.writeText(logContents)
      toast.success("Log file copied to clipboard")
    } catch (err) {
      console.error("Failed to copy log file:", err)
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
      console.error("Failed to copy troubleshooting info:", err)
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
        <h2 className="text-2xl font-semibold mb-2">Debugging</h2>
        <p className="text-sm text-muted-foreground">
          Tools for troubleshooting and clearing cached data
        </p>
      </div>

      <div className="space-y-0 divide-y divide-border">
        <SettingsRow
          title="Clean mod cache"
          description="Clear cached mod files to free up space"
          rightContent={
            <Button variant="outline" size="sm" onClick={handleCleanModCache}>
              Clean Cache
            </Button>
          }
        />

        <SettingsRow
          title="Clean online mod list"
          description="Clear the cached list of available mods from Thunderstore"
          rightContent={
            <Button variant="outline" size="sm" onClick={handleCleanOnlineModList}>
              Clean List
            </Button>
          }
        />

        <SettingsRow
          title="Copy log file"
          description="Copy the current log file to clipboard for debugging"
          rightContent={
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopyLogFile}
                disabled={isCopyingLogs}
              >
                {isCopyingLogs ? "Copying..." : "Copy Logs"}
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
          title="Copy troubleshooting info"
          description="Copy system and app information to help diagnose issues"
          rightContent={
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopyTroubleshootingInfo}
              disabled={isCopyingInfo}
            >
              {isCopyingInfo ? "Copying..." : "Copy Info"}
            </Button>
          }
        />
      </div>
    </div>
  )
}
