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
import { AlertTriangle, Loader2 } from "lucide-react"

type UninstallAllModsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  modCount: number
  onConfirm: () => void
  loading?: boolean
}

export function UninstallAllModsDialog({
  open,
  onOpenChange,
  modCount,
  onConfirm,
  loading = false,
}: UninstallAllModsDialogProps) {
  const { t } = useTranslation()

  return (
    <AlertDialog open={open} onOpenChange={loading ? undefined : onOpenChange}>
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
          <AlertDialogCancel disabled={loading}>{t("common_cancel")}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
            Uninstall All
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
