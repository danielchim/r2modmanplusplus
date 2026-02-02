type Direction = "renderer->main" | "main->renderer"

const isDevEnvironment = (() => {
  if (typeof process !== "undefined" && process.env && process.env.NODE_ENV) {
    return process.env.NODE_ENV !== "production"
  }
  return false
})()

function sanitizePayload(payload: unknown, depth = 0): unknown {
  if (depth > 4) {
    return "[Truncated]"
  }
  if (payload == null) {
    return payload
  }
  if (payload instanceof Error) {
    return {
      name: payload.name,
      message: payload.message,
      stack: payload.stack,
    }
  }
  if (typeof AbortController !== "undefined" && payload instanceof AbortController) {
    return "[AbortController]"
  }
  if (payload instanceof ArrayBuffer) {
    return `[ArrayBuffer ${payload.byteLength}]`
  }
  if (Array.isArray(payload)) {
    return payload.map((item) => sanitizePayload(item, depth + 1))
  }
  if (typeof payload === "object") {
    const entries = Object.entries(payload as Record<string, unknown>)
    return entries.reduce<Record<string, unknown>>((acc, [key, value]) => {
      acc[key] = sanitizePayload(value, depth + 1)
      return acc
    }, {})
  }
  return payload
}

export function logIpcRenderer(direction: Direction, channel: string, payload?: unknown): void {
  if (!isDevEnvironment) return
  if (typeof payload === "undefined") {
     
    console.debug(`[ipc:${direction}] ${channel}`)
    return
  }
   
  console.debug(`[ipc:${direction}] ${channel}`, sanitizePayload(payload))
}

export function makeLoggable<T>(payload: T): T {
  return sanitizePayload(payload) as T
}
