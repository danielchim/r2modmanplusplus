import { createFileRoute } from "@tanstack/react-router"
import { ModsLibrary } from "@/components/features/mods-library"

export const Route = createFileRoute("/_shell/")({
  component: HomeRoute,
})

function HomeRoute() {
  return <ModsLibrary />
}
