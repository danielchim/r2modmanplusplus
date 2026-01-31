import type { RendererGlobalElectronTRPC } from "electron-trpc-experimental/renderer"

export interface ElectronAPI {
  onMainProcessMessage: (callback: (message: string) => void) => void
  selectFolder: () => Promise<string | null>
  openFolder: (folderPath: string) => Promise<void>
  
  // Download events
  onDownloadUpdated: (callback: (data: unknown) => void) => () => void
  onDownloadProgress: (callback: (data: unknown) => void) => () => void
  onDownloadCompleted: (callback: (data: unknown) => void) => () => void
  onDownloadFailed: (callback: (data: unknown) => void) => () => void
}

export interface AppAPI {
  version: string
}

declare global {
  interface Window {
    electron?: ElectronAPI
    app?: AppAPI
    electronTRPC?: RendererGlobalElectronTRPC
  }
}
