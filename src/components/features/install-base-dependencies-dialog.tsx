import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

type InstallBaseDependenciesDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInstallAndLaunch: () => void
  onInstallOnly: () => void
  missing: string[]
  isInstalling: boolean
}

export function InstallBaseDependenciesDialog({
  open,
  onOpenChange,
  onInstallAndLaunch,
  onInstallOnly,
  missing,
  isInstalling,
}: InstallBaseDependenciesDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Install Base Dependencies?</AlertDialogTitle>
          <AlertDialogDescription>
            {isInstalling 
              ? "Downloading and installing mod loader files. This may take a moment..." 
              : "This profile is missing required mod loader files. The following components need to be installed:"
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        {!isInstalling && (
          <div className="rounded-md border border-primary/20 bg-primary/10 p-3">
            <ul className="list-disc list-inside space-y-1 text-sm">
              {missing.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        {isInstalling && (
          <div className="rounded-md border border-blue-500/20 bg-blue-500/10 p-4 text-center">
            <div className="animate-pulse text-sm text-blue-700 dark:text-blue-300">
              Downloading BepInEx package from Thunderstore...
            </div>
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isInstalling}>Cancel</AlertDialogCancel>
          <Button
            variant="outline"
            onClick={onInstallOnly}
            disabled={isInstalling}
          >
            Install Only
          </Button>
          <AlertDialogAction
            onClick={onInstallAndLaunch}
            disabled={isInstalling}
          >
            {isInstalling ? "Installing..." : "Install & Launch (Recommended)"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
