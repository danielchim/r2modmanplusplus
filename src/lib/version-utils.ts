/**
 * Compare two semantic versions (e.g., "1.2.3" vs "1.3.0")
 * @returns positive if v1 > v2, negative if v1 < v2, 0 if equal
 */
export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number)
  const parts2 = v2.split('.').map(Number)
  
  const maxLength = Math.max(parts1.length, parts2.length)
  
  for (let i = 0; i < maxLength; i++) {
    const part1 = parts1[i] || 0
    const part2 = parts2[i] || 0
    
    if (part1 > part2) return 1
    if (part1 < part2) return -1
  }
  
  return 0
}

/**
 * Check if version v1 is greater than v2
 */
export function isVersionGreater(v1: string, v2: string): boolean {
  return compareVersions(v1, v2) > 0
}

/**
 * Check if version v1 is less than v2
 */
export function isVersionLess(v1: string, v2: string): boolean {
  return compareVersions(v1, v2) < 0
}
