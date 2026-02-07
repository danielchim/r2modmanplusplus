import { migrate } from "drizzle-orm/better-sqlite3/migrator"
import { getDb } from "./index"
import { join } from "path"

export function runMigrations(): void {
  const db = getDb()
  // In development, migrations are relative to project root.
  // In production, they need to be bundled — adjust path as needed.
  const migrationsFolder = join(__dirname, "../../electron/db/migrations")
  migrate(db, { migrationsFolder })
}
