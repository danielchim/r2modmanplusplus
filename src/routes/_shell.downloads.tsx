import { createFileRoute } from "@tanstack/react-router"
import { DownloadsPage } from "@/components/features/downloads-page"

export const Route = createFileRoute("/_shell/downloads")({
  component: DownloadsRoute,
})

function DownloadsRoute() {
  return <DownloadsPage />
}
