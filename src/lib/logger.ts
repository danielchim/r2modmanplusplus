type LogLevel = "debug" | "info" | "warn" | "error"

interface LogEntry {
  level: LogLevel
  message: string
  data?: unknown
  timestamp: Date
}

class Logger {
  private isDev = (() => {
    if (typeof process !== "undefined" && process.env && process.env.NODE_ENV) {
      return process.env.NODE_ENV !== "production"
    }
    // In browser, check if we're in dev mode
    if (typeof window !== "undefined") {
      return import.meta.env?.DEV ?? false
    }
    return false
  })()

  private log(level: LogLevel, message: string, data?: unknown): void {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date(),
    }

    // In production, only log warnings and errors
    if (!this.isDev && (level === "debug" || level === "info")) {
      return
    }

    const prefix = `[${entry.timestamp.toISOString()}] [${level.toUpperCase()}]`
    const logMessage = data !== undefined ? `${prefix} ${message}` : `${prefix} ${message}`

    switch (level) {
      case "debug":
        // eslint-disable-next-line no-console
        console.debug(logMessage, data ?? "")
        break
      case "info":
        // eslint-disable-next-line no-console
        console.info(logMessage, data ?? "")
        break
      case "warn":
        // eslint-disable-next-line no-console
        console.warn(logMessage, data ?? "")
        break
      case "error":
        // eslint-disable-next-line no-console
        console.error(logMessage, data ?? "")
        break
    }

    // In Electron, optionally send logs to main process for file logging
    // This can be implemented later if needed via IPC
  }

  debug(message: string, data?: unknown): void {
    this.log("debug", message, data)
  }

  info(message: string, data?: unknown): void {
    this.log("info", message, data)
  }

  warn(message: string, data?: unknown): void {
    this.log("warn", message, data)
  }

  error(message: string, data?: unknown): void {
    this.log("error", message, data)
  }
}

export const logger = new Logger()
