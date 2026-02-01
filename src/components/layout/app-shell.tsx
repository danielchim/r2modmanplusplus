import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Menu } from "lucide-react"
import { Toaster } from "sonner"
import { GlobalRail } from "./global-rail"
import { ContextPanel } from "./context-panel"
import { MobileRailSheet } from "./mobile-rail-sheet"
import { SettingsDialog } from "@/components/features/settings/settings-dialog"
import { DownloadManager } from "@/components/features/download/download-manager"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store/app-store"

interface AppShellProps {
  children: React.ReactNode
  showContextPanel?: boolean
}

export function AppShell({ children, showContextPanel = true }: AppShellProps) {
  const { t } = useTranslation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const showContextPanelState = useAppStore((s) => s.showContextPanel)

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
          <h1 className="text-sm font-semibold">{t("app_title")}</h1>
        </div>

        {children}
      </div>
      {showContextPanel && showContextPanelState && <ContextPanel />}
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
