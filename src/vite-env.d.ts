/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly APP_VERSION: string
  readonly APP_MODE: "UAT" | "production"
  readonly APP_BUILD_TIME: string
  readonly APP_BUILD_INFO: string
  readonly VITE_DATASOURCE?: "db" | "zustand"
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
