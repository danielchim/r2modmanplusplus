import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import { app } from "electron"
import { join } from "path"
import * as schema from "./schema"

type AppDb = ReturnType<typeof drizzle<typeof schema>>

let db: AppDb | null = null
let sqlite: Database.Database | null = null

export function getDb(): AppDb {
  if (!db) {
    throw new Error("Database not initialized. Call initializeDb() first.")
  }
  return db
}

export function initializeDb(): AppDb {
  const dbPath = join(app.getPath("userData"), "r2modman.db")
  sqlite = new Database(dbPath)
  sqlite.pragma("journal_mode = WAL")
  sqlite.pragma("foreign_keys = ON")

  db = drizzle({ client: sqlite, schema })
  return db
}

export function closeDb(): void {
  if (sqlite) {
    sqlite.close()
    sqlite = null
    db = null
  }
}
