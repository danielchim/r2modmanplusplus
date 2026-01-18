import { Sheet, SheetContent } from "@/components/ui/sheet"
import { GlobalRailContent } from "./global-rail"

interface MobileRailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileRailSheet({ open, onOpenChange }: MobileRailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="p-0 w-[240px]">
        <GlobalRailContent onNavigate={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  )
}
