import type { Mod } from "@/mocks/mods"

export type ParsedDependency = {
  raw: string
  fullString: string // Full dependency string for display
  owner: string
  name: string
  version?: string // Required version (if specified)
  requiredVersion?: string // Alias for compatibility
  key: string // "Owner-Package" stable identifier
  isValid: boolean
}

export type DependencyStatus = "installed_correct" | "installed_wrong" | "not_installed" | "unresolved"

export type DependencyInfo = {
  raw: string
  parsed: ParsedDependency
  resolvedMod?: Mod
  status: DependencyStatus
  installedVersion?: string
  requiredVersion?: string
}

/**
 * Parses a Thunderstore dependency string.
 * Supports formats:
 * - "Owner-Package-Version" (e.g., "BepInEx-BepInExPack-5.4.21")
 * - "Owner-Package" (e.g., "BepInEx-BepInExPack")
 */
export function parseDependencyString(dep: string): ParsedDependency {
  const trimmed = dep.trim()
  
  if (!trimmed) {
    return {
      raw: dep,
      fullString: dep,
      owner: "",
      name: "",
      key: "",
      isValid: false,
    }
  }
  
  const parts = trimmed.split("-")
  
  if (parts.length < 2) {
    // Invalid format
    return {
      raw: dep,
      fullString: dep,
      owner: "",
      name: trimmed,
      key: trimmed,
      isValid: false,
    }
  }
  
  if (parts.length === 2) {
    // Format: "Owner-Package"
    const [owner, name] = parts
    return {
      raw: dep,
      fullString: dep,
      owner,
      name,
      key: `${owner}-${name}`,
      isValid: true,
    }
  }
  
  // Format: "Owner-Package-Version" (parts.length >= 3)
  // Last part is version, middle parts are package name (may contain hyphens)
  const owner = parts[0]
  const version = parts[parts.length - 1]
  const name = parts.slice(1, -1).join("-")
  
  return {
    raw: dep,
    fullString: dep,
    owner,
    name,
    version,
    requiredVersion: version,
    key: `${owner}-${name}`,
    isValid: true,
  }
}

/**
 * Resolves a parsed dependency to a Mod in the catalog.
 * Returns null if not found or gameId doesn't match.
 */
export function resolveDependencyToMod(
  gameId: string,
  parsed: ParsedDependency,
  mods: Mod[]
): Mod | null {
  if (!parsed.isValid) {
    return null
  }
  
  const match = mods.find(
    (m) =>
      m.gameId === gameId &&
      m.author === parsed.owner &&
      m.name === parsed.name
  )
  
  return match || null
}

/**
 * Computes the status of a dependency.
 */
export function computeDependencyStatus({
  parsed,
  resolvedMod,
  installedVersion,
  enforceVersions,
}: {
  parsed: ParsedDependency
  resolvedMod: Mod | null
  installedVersion?: string
  enforceVersions: boolean
}): DependencyStatus {
  // Not found in catalog
  if (!resolvedMod) {
    return "unresolved"
  }
  
  // Not installed
  if (!installedVersion) {
    return "not_installed"
  }
  
  // Check version mismatch (only if enforce is enabled and required version exists)
  if (enforceVersions && parsed.requiredVersion) {
    if (installedVersion !== parsed.requiredVersion) {
      return "installed_wrong"
    }
  }
  
  return "installed_correct"
}

/**
 * Builds a full DependencyInfo object for a dependency string.
 */
export function analyzeDependency({
  depString,
  gameId,
  mods,
  installedVersions,
  enforceVersions,
}: {
  depString: string
  gameId: string
  mods: Mod[]
  installedVersions: Record<string, string>
  enforceVersions: boolean
}): DependencyInfo {
  const parsed = parseDependencyString(depString)
  const resolvedMod = resolveDependencyToMod(gameId, parsed, mods)
  const installedVersion = resolvedMod ? installedVersions[resolvedMod.id] : undefined
  const status = computeDependencyStatus({
    parsed,
    resolvedMod: resolvedMod || null,
    installedVersion,
    enforceVersions,
  })
  
  return {
    raw: depString,
    parsed,
    resolvedMod: resolvedMod || undefined,
    status,
    installedVersion,
    requiredVersion: parsed.requiredVersion,
  }
}

/**
 * Analyzes all dependencies for a mod.
 */
export function analyzeModDependencies({
  mod,
  mods,
  installedVersions,
  enforceVersions,
}: {
  mod: Mod
  mods: Mod[]
  installedVersions: Record<string, string>
  enforceVersions: boolean
}): DependencyInfo[] {
  return mod.dependencies.map((dep) =>
    analyzeDependency({
      depString: dep,
      gameId: mod.gameId,
      mods,
      installedVersions,
      enforceVersions,
    })
  )
}
