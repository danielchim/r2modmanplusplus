/**
 * Resolved datasource mode. Read once at module load time — Vite statically
 * replaces `import.meta.env.VITE_DATASOURCE` at build time so this is
 * effectively a compile-time constant and allows tree-shaking of unused paths.
 */
export const DATASOURCE: "db" | "zustand" =
  (import.meta.env.VITE_DATASOURCE as "db" | "zustand" | undefined) ?? "db"

export const isDbMode = DATASOURCE === "db"
export const isZustandMode = DATASOURCE === "zustand"
