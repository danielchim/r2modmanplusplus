// Desktop-only features with web fallbacks

/**
 * Check if running in desktop environment
 */
export function isDesktop(): boolean {
  return typeof window !== 'undefined' && window.electron !== undefined
}

/**
 * Open a folder in the system file explorer
 * Fallback: copies path to clipboard in web environment
 */
export async function openFolder(path: string): Promise<void> {
  if (isDesktop() && window.electron) {
    await window.electron.openFolder(path)
    return
  }
  
  // Web fallback: copy to clipboard
  await copyToClipboard(path)
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    try {
      document.execCommand('copy')
    } finally {
      document.body.removeChild(textArea)
    }
  }
}

/**
 * Select a folder using native file picker
 * Returns selected path or null if cancelled
 * Web fallback: shows input dialog
 */
export async function selectFolder(): Promise<string | null> {
  if (isDesktop() && window.electron) {
    return await window.electron.selectFolder()
  }
  
  // Web fallback: prompt for path
  const path = prompt('Enter folder path:')
  return path
}
