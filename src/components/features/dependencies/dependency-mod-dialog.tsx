import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ModInspectorContent } from "@/components/features/mod-inspector"
import type { Mod } from "@/types/mod"

type DependencyModDialogProps = {
  mod: Mod | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DependencyModDialog({ mod, open, onOpenChange }: DependencyModDialogProps) {
  if (!mod) {
    return null
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="sr-only">
          <DialogTitle>{mod.name}</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1">
          <ModInspectorContent mod={mod} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
