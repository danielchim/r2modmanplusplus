import { createFileRoute } from "@tanstack/react-router"
import { ConfigEditorCenter } from "@/components/features/config-editor/config-editor-center"

export const Route = createFileRoute("/_shell/config-editor")({
  component: ConfigEditorRoute,
})

function ConfigEditorRoute() {
  return <ConfigEditorCenter />
}
