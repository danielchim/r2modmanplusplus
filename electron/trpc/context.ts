import type { IpcMainInvokeEvent } from "electron"

/**
 * Context passed to tRPC procedures
 * Includes the IPC event for security checks and sender info
 */
export interface Context {
  event: IpcMainInvokeEvent
}

/**
 * Create context for each tRPC request
 * This runs before every procedure and can be used for auth/security checks
 */
export async function createContext({ event }: { event: IpcMainInvokeEvent }): Promise<Context> {
  // You can add security checks here
  // For example, validate that the sender is a known window
  // const senderId = event.sender.id
  // if (!allowedSenderIds.has(senderId)) {
  //   throw new Error("Unauthorized sender")
  // }

  return {
    event,
  }
}

export type AppContext = Context
