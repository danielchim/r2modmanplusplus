import { useRouterState } from "@tanstack/react-router"
import { ModsLibrary } from "@/components/features/mods-library"
import { DownloadsPage } from "@/components/features/downloads-page"

export function MainStage() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">
      {pathname === "/downloads" ? <DownloadsPage /> : <ModsLibrary />}
    </div>
  )
}
