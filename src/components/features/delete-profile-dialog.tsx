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
}

export function DeleteProfileDialog({
  open,
  onOpenChange,
  profileName,
  onConfirm,
  disabled = false,
  disabledReason,
}: DeleteProfileDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Profile</AlertDialogTitle>
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
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={disabled}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete Profile
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
