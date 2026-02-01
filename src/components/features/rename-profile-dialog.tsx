import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
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
  const { t } = useTranslation()
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
          <DialogTitle>{t("dialog_rename_profile_title")}</DialogTitle>
          <DialogDescription>
            {t("dialog_rename_profile_description", { name: currentName })}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="profile-name" className="text-sm font-medium">
              {t("dialog_rename_profile_name_label")}
            </label>
            <Input
              id="profile-name"
              placeholder={t("dialog_rename_profile_placeholder")}
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
            {t("common_cancel")}
          </Button>
          <Button 
            onClick={handleRename} 
            disabled={!profileName.trim() || profileName.trim() === currentName}
          >
            {t("dialog_rename_profile_button")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
