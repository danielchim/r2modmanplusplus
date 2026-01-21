export interface ElectronAPI {
  onMainProcessMessage: (callback: (message: string) => void) => void
  selectFolder: () => Promise<string | null>
  openFolder: (folderPath: string) => Promise<void>
}

export interface AppAPI {
  version: string
}

declare global {
  interface Window {
    electron?: ElectronAPI
    app?: AppAPI
  }
}
