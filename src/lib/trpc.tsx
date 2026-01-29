import type { QueryClient } from "@tanstack/react-query"
import { createTRPCReact } from "@trpc/react-query"
import { ipcLink } from "electron-trpc-experimental/renderer"
import superjson from "superjson"
import type { AppRouter } from "../../electron/trpc/router"
import type { ReactElement, ReactNode } from "react"

/**
 * Create tRPC React hooks
 * This is typed with the AppRouter from the Electron main process
 */
export const trpc = createTRPCReact<AppRouter>()

/**
 * Check if we're running in Electron with the tRPC IPC bridge
 */
export function hasElectronTRPC(): boolean {
  return typeof window !== "undefined" && "electronTRPC" in window
}

/**
 * Create tRPC client for use in Electron renderer
 * Returns null if not running in Electron (web mode)
 */
export function createTRPCClient() {
  if (!hasElectronTRPC()) {
    return null
  }

  return trpc.createClient({
    links: [
      ipcLink({
        transformer: superjson,
      }),
    ],
  })
}

/**
 * tRPC Provider component that wraps the app
 * Conditionally creates the client only in Electron mode
 */
export function TRPCProvider({
  children,
  queryClient,
}: {
  children: ReactNode
  queryClient: QueryClient
}): ReactElement {
  const trpcClient = createTRPCClient()

  // If not in Electron mode, render children without tRPC provider
  if (!trpcClient) {
    return <>{children}</>
  }

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      {children}
    </trpc.Provider>
  )
}
