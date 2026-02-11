/**
 * Lazy vanilla (non-React) tRPC client singleton.
 * Used by query/mutation hooks to call the Electron main process over IPC.
 */
import { createVanillaTRPCClient } from "@/lib/trpc"
import type { AppRouter } from "../../electron/trpc/router"
import type { TRPCClient } from "@trpc/client"

let _client: TRPCClient<AppRouter> | null = null

export function getClient(): TRPCClient<AppRouter> {
  if (!_client) {
    _client = createVanillaTRPCClient()
    if (!_client) {
      throw new Error(
        "electronTRPC is not available. DB mode requires running inside Electron.",
      )
    }
  }
  return _client
}
