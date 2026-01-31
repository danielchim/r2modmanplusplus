/**
 * Download manager - no longer simulates downloads
 * Real downloads are handled by main process
 */
export function DownloadManager() {
  // This component is now empty - downloads are managed by main process
  // and state is synced via IPC events handled in use-download-actions.ts
  return null
}
