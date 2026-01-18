import {
  createRouter as createTanStackRouter,
  createBrowserHistory,
  createHashHistory,
} from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"

function resolveHistoryType(): "browser" | "hash" {
  // Electron / file protocol safety net
  if (typeof window !== "undefined" && window.location.protocol === "file:") {
    return "hash"
  }

  const envChoice = import.meta.env.VITE_ROUTER_HISTORY as
    | "browser"
    | "hash"
    | undefined

  if (envChoice === "hash" || envChoice === "browser") return envChoice

  // Default for normal web dev/build
  return "browser"
}

export function createRouter() {
  const historyType = resolveHistoryType()
  const history =
    historyType === "hash" ? createHashHistory() : createBrowserHistory()

  return createTanStackRouter({
    routeTree,
    history,
    defaultPreload: "intent",
  })
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
