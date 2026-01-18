import { SettingsRow } from "../settings-row"
import { Button } from "@/components/ui/button"

interface PanelProps {
  searchQuery?: string
}

export function DebuggingPanel(_props: PanelProps) {
  const handleCleanModCache = () => {
    // TODO: Implement mod cache clearing
    console.log("Cleaning mod cache...")
  }

  const handleCleanOnlineModList = () => {
    // TODO: Implement online mod list cache clearing
    console.log("Cleaning online mod list...")
  }

  const handleCopyLogFile = async () => {
    // TODO: Read actual log file contents
    const logContents = "Sample log file contents...\nTimestamp: " + new Date().toISOString()
    
    try {
      await navigator.clipboard.writeText(logContents)
      console.log("Log file copied to clipboard")
      // TODO: Show toast notification
    } catch (err) {
      console.error("Failed to copy log file:", err)
    }
  }

  const handleCopyTroubleshootingInfo = async () => {
    // TODO: Gather actual troubleshooting info (OS, app version, game info, etc.)
    const troubleshootingInfo = [
      "r2modman Troubleshooting Information",
      "================================",
      "App Version: 1.0.0",
      "Platform: " + navigator.platform,
      "User Agent: " + navigator.userAgent,
      "Timestamp: " + new Date().toISOString(),
      "",
      "// Additional system info would go here"
    ].join("\n")

    try {
      await navigator.clipboard.writeText(troubleshootingInfo)
      console.log("Troubleshooting info copied to clipboard")
      // TODO: Show toast notification
    } catch (err) {
      console.error("Failed to copy troubleshooting info:", err)
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
            <Button variant="outline" size="sm" onClick={handleCopyLogFile}>
              Copy Logs
            </Button>
          }
        />

        <SettingsRow
          title="Copy troubleshooting info"
          description="Copy system and app information to help diagnose issues"
          rightContent={
            <Button variant="outline" size="sm" onClick={handleCopyTroubleshootingInfo}>
              Copy Info
            </Button>
          }
        />
      </div>
    </div>
  )
}
