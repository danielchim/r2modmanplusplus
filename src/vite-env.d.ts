/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly APP_VERSION: string
  readonly APP_MODE: "UAT" | "production"
  readonly APP_BUILD_TIME: string
  readonly APP_BUILD_INFO: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
