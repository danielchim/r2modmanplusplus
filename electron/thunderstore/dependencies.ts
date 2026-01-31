/**
 * Thunderstore dependency resolution
 * Resolves dependency strings to actual Thunderstore packages within the same community
 */
import { ensureCatalogUpToDate, resolvePackagesByOwnerName } from "./catalog"
import { transformPackage } from "./transform"
import type { Mod } from "../../src/types/mod"

/**
 * Parsed dependency information
 */
export type ParsedDependency = {
  raw: string
  fullString: string
  owner: string
  name: string
  version?: string
  requiredVersion?: string
  key: string
  isValid: boolean
}

/**
 * Dependency resolution status
 */
export type DependencyStatus = "installed_correct" | "installed_wrong" | "not_installed" | "unresolved"

/**
 * Full dependency information including resolved mod and status
 */
export type DependencyInfo = {
  raw: string
  parsed: ParsedDependency
  resolvedMod?: Mod
  status: DependencyStatus
  installedVersion?: string
  requiredVersion?: string
}

/**
 * Parameters for resolving dependencies
 */
export interface ResolveDependenciesParams {
  packageIndexUrl: string
  gameId: string
  dependencies: string[]
  installedVersions: Record<string, string>
  enforceVersions: boolean
}

/**
 * Parses a Thunderstore dependency string
 * Supports formats:
 * - "Owner-Package-Version" (e.g., "BepInEx-BepInExPack-5.4.21")
 * - "Owner-Package" (e.g., "BepInEx-BepInExPack")
 */
function parseDependencyString(dep: string): ParsedDependency {
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
 * Computes the status of a dependency
 */
function computeDependencyStatus({
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
 * Resolves dependencies for a mod within the same Thunderstore community
 * Now uses SQLite catalog for bounded-memory operation
 * 
 * @param params - Resolution parameters
 * @returns Array of dependency info objects with resolved mods and statuses
 */
export async function resolveDependencies(params: ResolveDependenciesParams): Promise<DependencyInfo[]> {
  const {
    packageIndexUrl,
    gameId,
    dependencies,
    installedVersions,
    enforceVersions,
  } = params

  // Ensure catalog is up-to-date
  await ensureCatalogUpToDate(packageIndexUrl)

  // Parse all dependencies and collect keys
  const parsedDeps = dependencies.map(dep => parseDependencyString(dep))
  const keysToResolve = parsedDeps
    .filter(p => p.isValid && p.key)
    .map(p => p.key)

  // Resolve packages via catalog (single DB query)
  const packageMap = resolvePackagesByOwnerName(packageIndexUrl, keysToResolve)

  // Build results
  const results: DependencyInfo[] = []

  for (const parsed of parsedDeps) {
    // Try to resolve via map
    let resolvedMod: Mod | undefined = undefined
    if (parsed.isValid && parsed.key) {
      const pkg = packageMap.get(parsed.key)
      if (pkg && pkg.versions.length > 0) {
        resolvedMod = transformPackage(pkg, gameId)
      }
    }

    // Compute status
    const installedVersion = resolvedMod ? installedVersions[resolvedMod.id] : undefined
    const status = computeDependencyStatus({
      parsed,
      resolvedMod: resolvedMod || null,
      installedVersion,
      enforceVersions,
    })

    results.push({
      raw: parsed.raw,
      parsed,
      resolvedMod,
      status,
      installedVersion,
      requiredVersion: parsed.requiredVersion,
    })
  }

  return results
}
