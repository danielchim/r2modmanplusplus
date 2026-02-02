/**
 * Opens a URL in the external browser
 * Uses Electron's openExternal API when available, falls back to window.open
 */
export function openExternalUrl(url: string): void {
  if (typeof window !== "undefined" && window.electron?.openExternal) {
    window.electron.openExternal(url)
  } else {
    window.open(url, "_blank", "noopener,noreferrer")
  }
}

/**
 * Creates an onClick handler for external links
 * Prevents default navigation and opens in external browser
 */
export function createExternalLinkHandler(url: string) {
  return (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    openExternalUrl(url)
  }
}
