import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Menu, PanelRightOpen } from "lucide-react"
import { Toaster } from "sonner"
import { GlobalRail } from "./global-rail"
import { ContextPanel } from "./context-panel"
import { MobileRailSheet } from "./mobile-rail-sheet"
import { MobileContextSheet } from "./mobile-context-sheet"
import { SettingsDialog } from "@/components/features/settings/settings-dialog"
import { DownloadManager } from "@/components/features/download/download-manager"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store/app-store"

interface AppShellProps {
  children: React.ReactNode
  showContextPanel?: boolean
}

const LG_BREAKPOINT = 1024

export function AppShell({ children, showContextPanel = true }: AppShellProps) {
  const { t } = useTranslation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLargeScreen, setIsLargeScreen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= LG_BREAKPOINT : true
  )
  const showContextPanelState = useAppStore((s) => s.showContextPanel)
  const setShowContextPanel = useAppStore((s) => s.setShowContextPanel)

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${LG_BREAKPOINT}px)`)
    const handler = () => setIsLargeScreen(mq.matches)
    handler()
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background text-foreground">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-full">
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
          <h1 className="text-sm font-semibold flex-1">{t("app_title")}</h1>
          {showContextPanel && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowContextPanel(true)}
              aria-label="Open panel"
            >
              <PanelRightOpen className="size-5" />
            </Button>
          )}
        </div>

        {children}
      </div>
      {/* Desktop: fixed right context panel */}
      {showContextPanel && showContextPanelState && (
        <div className="hidden lg:block">
          <ContextPanel />
        </div>
      )}
      {/* Mobile only: right panel as sheet (not rendered on lg+ so portal doesn't show on desktop) */}
      {showContextPanel && !isLargeScreen && (
        <MobileContextSheet
          open={showContextPanelState}
          onOpenChange={setShowContextPanel}
        />
      )}
      <SettingsDialog />
      <DownloadManager />
      <Toaster 
        position="bottom-right"
        className="z-[100]"
        toastOptions={{ 
          classNames: {
            toast: "z-[100]",
          }
        }} 
      />
    </div>
  )
}
