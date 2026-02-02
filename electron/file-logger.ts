import { app } from "electron"
import { promises as fs, statSync, renameSync } from "fs"
import { join } from "path"

interface LogEntry {
  timestamp: Date
  level: "debug" | "info" | "warn" | "error"
  message: string
  data?: unknown
}

class FileLogger {
  private logFilePath: string
  private logQueue: LogEntry[] = []
  private flushInterval: NodeJS.Timeout | null = null
  private maxLogSizeBytes = 10 * 1024 * 1024 // 10MB
  private isWriting = false

  constructor() {
    const logsDir = join(app.getPath("userData"), "logs")
    const latestLogPath = join(logsDir, "log.latest.txt")
    
    // Ensure logs directory exists
    this.ensureLogDirectory()
    
    // On startup, rotate existing log.latest.txt if it exists
    this.rotateExistingLog(latestLogPath, logsDir)
    
    // Use log.latest.txt as the main log file
    this.logFilePath = latestLogPath
    
    // Flush logs every 2 seconds
    this.flushInterval = setInterval(() => {
      this.flush()
    }, 2000)
  }

  private rotateExistingLog(latestLogPath: string, logsDir: string): void {
    try {
      // Use synchronous operations to ensure rotation completes before any logs are written
      const stats = statSync(latestLogPath)
      // Get the file's last modification time
      const lastModified = stats.mtime
      // Format timestamp: YYYY-MM-DDTHH-MM-SS (replace colons with hyphens for filename compatibility)
      const timestamp = lastModified.toISOString().replace(/:/g, "-").split(".")[0]
      const rotatedPath = join(logsDir, `r2modman-${timestamp}.log`)
      
      // Rename the existing log.latest.txt to include the last open time
      renameSync(latestLogPath, rotatedPath)
    } catch (error) {
      // File doesn't exist yet, no need to rotate
      // This is expected on first run
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        console.error("Failed to rotate existing log file:", error)
      }
    }
  }

  private async ensureLogDirectory() {
    const logsDir = join(app.getPath("userData"), "logs")
    try {
      await fs.mkdir(logsDir, { recursive: true })
    } catch (error) {
      console.error("Failed to create logs directory:", error)
    }
  }

  private formatLogEntry(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString()
    const level = entry.level.toUpperCase().padEnd(5)
    let line = `[${timestamp}] ${level} ${entry.message}`
    
    if (entry.data !== undefined) {
      try {
        const dataStr = typeof entry.data === "string" 
          ? entry.data 
          : JSON.stringify(entry.data, null, 2)
        line += `\n${dataStr}`
      } catch (error) {
        line += `\n[Serialization Error: ${error}]`
      }
    }
    
    return line + "\n"
  }

  private async rotateLogIfNeeded() {
    try {
      const stats = await fs.stat(this.logFilePath)
      if (stats.size > this.maxLogSizeBytes) {
        const rotatedPath = `${this.logFilePath}.old`
        await fs.rename(this.logFilePath, rotatedPath)
      }
    } catch {
      // File doesn't exist yet, no need to rotate
    }
  }

  private async flush() {
    if (this.isWriting || this.logQueue.length === 0) {
      return
    }

    this.isWriting = true
    const entries = [...this.logQueue]
    this.logQueue = []

    try {
      await this.rotateLogIfNeeded()
      const lines = entries.map((entry) => this.formatLogEntry(entry)).join("")
      await fs.appendFile(this.logFilePath, lines, "utf-8")
    } catch (error) {
      console.error("Failed to write log file:", error)
      // Put entries back in queue
      this.logQueue.unshift(...entries)
    } finally {
      this.isWriting = false
    }
  }

  log(level: "debug" | "info" | "warn" | "error", message: string, data?: unknown) {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      data,
    }
    
    this.logQueue.push(entry)
    
    // Also log to console in development
    const isDevEnvironment = process.env.NODE_ENV !== "production"
    if (isDevEnvironment) {
      const consoleMethod = console[level] || console.log
      if (data !== undefined) {
        consoleMethod(`[${level.toUpperCase()}] ${message}`, data)
      } else {
        consoleMethod(`[${level.toUpperCase()}] ${message}`)
      }
    }
  }

  debug(message: string, data?: unknown) {
    this.log("debug", message, data)
  }

  info(message: string, data?: unknown) {
    this.log("info", message, data)
  }

  warn(message: string, data?: unknown) {
    this.log("warn", message, data)
  }

  error(message: string, data?: unknown) {
    this.log("error", message, data)
  }

  async getLogContents(): Promise<string> {
    // Flush any pending logs first
    await this.flush()
    
    try {
      const contents = await fs.readFile(this.logFilePath, "utf-8")
      return contents
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return "No log file found. Start using the app to generate logs."
      }
      throw error
    }
  }

  async getRecentLogs(lineCount: number = 100): Promise<string> {
    const contents = await this.getLogContents()
    const lines = contents.split("\n")
    const recentLines = lines.slice(-lineCount).join("\n")
    return recentLines
  }

  getLogFilePath(): string {
    return this.logFilePath
  }

  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
      this.flushInterval = null
    }
    // Final flush
    this.flush()
  }
}

// Singleton instance
let logger: FileLogger | null = null

export function initializeLogger(): FileLogger {
  if (!logger) {
    logger = new FileLogger()
  }
  return logger
}

export function getLogger(): FileLogger {
  if (!logger) {
    throw new Error("Logger not initialized. Call initializeLogger() first.")
  }
  return logger
}

export function destroyLogger() {
  if (logger) {
    logger.destroy()
    logger = null
  }
}
