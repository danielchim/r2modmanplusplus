import { useTranslation } from "react-i18next"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertTriangle } from "lucide-react"

type UninstallAllModsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  modCount: number
  onConfirm: () => void
}

export function UninstallAllModsDialog({
  open,
  onOpenChange,
  modCount,
  onConfirm,
}: UninstallAllModsDialogProps) {
  const { t } = useTranslation()
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <AlertTriangle className="text-destructive" />
          </AlertDialogMedia>
          <AlertDialogTitle>{t("dialog_uninstall_all_mods_title")}</AlertDialogTitle>
          <AlertDialogDescription>
            This will uninstall <strong>{modCount}</strong> mod{modCount === 1 ? '' : 's'} from the current profile.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("common_cancel")}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleConfirm}>
            Uninstall All
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
