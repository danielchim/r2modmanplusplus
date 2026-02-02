import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useAppStore } from "@/store/app-store"
import { GameDashboard } from "@/components/features/game-dashboard"
import { ModInspector } from "@/components/features/mod-inspector"

interface MobileContextSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileContextSheet({ open, onOpenChange }: MobileContextSheetProps) {
  const selectedModId = useAppStore((s) => s.selectedModId)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="p-0 w-full max-w-md sm:max-w-lg flex flex-col h-full"
        showCloseButton={true}
      >
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {selectedModId ? <ModInspector /> : <GameDashboard />}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
