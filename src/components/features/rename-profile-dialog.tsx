import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type RenameProfileDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRenameProfile: (newName: string) => void
  currentName: string
}

export function RenameProfileDialog({ open, onOpenChange, onRenameProfile, currentName }: RenameProfileDialogProps) {
  const [profileName, setProfileName] = useState(currentName)

  // Update local state when currentName changes or dialog opens
  useEffect(() => {
    if (open) {
      setProfileName(currentName)
    }
  }, [open, currentName])

  const handleRename = () => {
    if (profileName.trim() && profileName.trim() !== currentName) {
      onRenameProfile(profileName.trim())
      onOpenChange(false)
    }
  }

  const handleCancel = () => {
    setProfileName(currentName)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onOverlayClick={handleCancel}
      >
        <DialogHeader>
          <DialogTitle>Rename Profile</DialogTitle>
          <DialogDescription>
            Enter a new name for your profile "{currentName}".
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="profile-name" className="text-sm font-medium">
              Profile Name
            </label>
            <Input
              id="profile-name"
              placeholder="e.g., Hardcore, Co-op, Testing"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleRename()
                }
              }}
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleRename} 
            disabled={!profileName.trim() || profileName.trim() === currentName}
          >
            Rename Profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
