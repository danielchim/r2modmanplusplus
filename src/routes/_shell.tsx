import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router"
import { AppShell } from "@/components/layout/app-shell"

export const Route = createFileRoute("/_shell")({
  component: ShellLayout,
})

function ShellLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const showContextPanel = pathname !== "/downloads"

  return (
    <AppShell showContextPanel={showContextPanel}>
      <Outlet />
    </AppShell>
  )
}
