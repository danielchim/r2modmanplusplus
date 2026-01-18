import { SettingsRow } from "../settings-row"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Dialog } from "@base-ui/react/dialog"

interface PanelProps {
  searchQuery?: string
}

export function ModpacksPanel(_props: PanelProps) {
  const [showDependencies, setShowDependencies] = useState(false)

  // TODO: Get actual installed mods from mod store
  const mockDependencies = [
    "BepInEx-BepInExPack-5.4.21",
    "RiskofThunder-HookGenPatcher-1.2.3",
    "bbepis-BepInExConfigManager-17.1.0",
    "tristanmcpherson-R2API-5.0.3",
  ]

  const handleCopyDependencies = async () => {
    const dependencyString = mockDependencies.join("\n")
    
    try {
      await navigator.clipboard.writeText(dependencyString)
      console.log("Dependencies copied to clipboard")
      // TODO: Show toast notification
    } catch (err) {
      console.error("Failed to copy dependencies:", err)
    }
  }

  return (
    <>
      <div>
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Modpacks</h2>
          <p className="text-sm text-muted-foreground">
            View and manage modpack information
          </p>
        </div>

        <div className="space-y-0 divide-y divide-border">
          <SettingsRow
            title="Show dependency strings"
            description="View all installed mods formatted as Author-ModName-Version"
            rightContent={
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowDependencies(true)}
              >
                Show Dependencies
              </Button>
            }
          />
        </div>
      </div>

      <Dialog.Root open={showDependencies} onOpenChange={setShowDependencies}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-gray-900 rounded-lg shadow-xl w-[600px] max-h-[70vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Dependency Strings
              </Dialog.Title>
              <Dialog.Close className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Dialog.Close>
            </div>
            
            <div className="flex-1 overflow-auto p-4">
              <div className="bg-gray-100 dark:bg-gray-800 rounded p-4 font-mono text-sm">
                {mockDependencies.map((dep, i) => (
                  <div key={i} className="text-gray-900 dark:text-gray-100">
                    {dep}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCopyDependencies}
              >
                Copy to Clipboard
              </Button>
              <Dialog.Close>
                <Button variant="default" size="sm">
                  Close
                </Button>
              </Dialog.Close>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
