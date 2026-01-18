import { useState } from "react"
import { Menu } from "lucide-react"
import { GlobalRail } from "./global-rail"
import { ContextPanel } from "./context-panel"
import { MobileRailSheet } from "./mobile-rail-sheet"
import { Button } from "@/components/ui/button"

interface AppShellProps {
  children: React.ReactNode
  showContextPanel?: boolean
}

export function AppShell({ children, showContextPanel = true }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background text-foreground">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <GlobalRail />
      </div>

      {/* Mobile Menu Sheet */}
      <MobileRailSheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />

      <div className="flex flex-1 flex-col overflow-hidden bg-background">
        {/* Mobile Top Bar */}
        <div className="lg:hidden shrink-0 border-b border-border bg-card px-4 py-2 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>
          <h1 className="text-sm font-semibold">r2modman</h1>
        </div>

        {children}
      </div>
      {showContextPanel && <ContextPanel />}
    </div>
  )
}
