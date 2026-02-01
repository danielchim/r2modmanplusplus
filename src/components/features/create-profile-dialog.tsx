import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type CreateProfileDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateProfile: (profileName: string) => void
}

export function CreateProfileDialog({ open, onOpenChange, onCreateProfile }: CreateProfileDialogProps) {
  const { t } = useTranslation()
  const [profileName, setProfileName] = useState("")

  const handleCreate = () => {
    if (profileName.trim()) {
      onCreateProfile(profileName.trim())
      setProfileName("")
      onOpenChange(false)
    }
  }

  const handleCancel = () => {
    setProfileName("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onOverlayClick={handleCancel}
      >
        <DialogHeader>
          <DialogTitle>{t("dialog_create_new_profile_title")}</DialogTitle>
          <DialogDescription>
            Enter a name for your new profile. You can use profiles to manage different mod configurations.
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
                  handleCreate()
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
          <Button onClick={handleCreate} disabled={!profileName.trim()}>
            Create Profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
