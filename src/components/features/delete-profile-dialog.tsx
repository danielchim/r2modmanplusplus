import { useTranslation } from "react-i18next"
import { Loader2 } from "lucide-react"
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

type DeleteProfileDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  profileName: string
  onConfirm: () => void
  disabled?: boolean
  disabledReason?: string
  loading?: boolean
}

export function DeleteProfileDialog({
  open,
  onOpenChange,
  profileName,
  onConfirm,
  disabled = false,
  disabledReason,
  loading = false,
}: DeleteProfileDialogProps) {
  const { t } = useTranslation()
  return (
    <AlertDialog open={open} onOpenChange={loading ? undefined : onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("dialog_delete_profile_title")}</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the profile "{profileName}"? This will
            remove all installed mods and settings for this profile. This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {disabled && disabledReason && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
            <p className="text-sm text-destructive">{disabledReason}</p>
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{t("common_cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={disabled || loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
            Delete Profile
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
