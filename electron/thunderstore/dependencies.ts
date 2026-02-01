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
 * Node in the dependency graph
 */
export type DependencyNode = DependencyInfo & {
  key: string
  depth: number
}

/**
 * Recursive dependency resolution result with graph metadata
 */
export interface RecursiveDependencyResult {
  nodes: DependencyNode[]
  parentsByKey: Record<string, string[]>
  childrenByKey: Record<string, string[]>
  rootKeys: string[]
  conflicts: Array<{
    key: string
    versions: string[]
  }>
}

/**
 * Parameters for recursive dependency resolution
 */
export interface ResolveDependenciesRecursiveParams {
  packageIndexUrl: string
  gameId: string
  dependencies: string[]
  installedVersions: Record<string, string>
  enforceVersions: boolean
  maxDepth?: number
  maxNodes?: number
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

/**
 * Resolves dependencies recursively with BFS traversal and cycle protection
 * Returns a complete dependency graph with parent/child relationships
 * 
 * @param params - Recursive resolution parameters
 * @returns Dependency graph with metadata for enforcing closure
 */
export async function resolveDependenciesRecursive(
  params: ResolveDependenciesRecursiveParams
): Promise<RecursiveDependencyResult> {
  const {
    packageIndexUrl,
    gameId,
    dependencies,
    installedVersions,
    enforceVersions,
    maxDepth = 10,
    maxNodes = 500,
  } = params

  // Ensure catalog is up-to-date
  await ensureCatalogUpToDate(packageIndexUrl)

  // Track visited keys to prevent cycles
  const visitedKeys = new Set<string>()
  
  // Graph metadata
  const nodes: DependencyNode[] = []
  const parentsByKey: Record<string, string[]> = {}
  const childrenByKey: Record<string, string[]> = {}
  const rootKeys: string[] = []
  const versionsByKey: Record<string, Set<string>> = {}

  // BFS queue: [depString, depth, parentKey?]
  type QueueItem = { depString: string; depth: number; parentKey?: string }
  const queue: QueueItem[] = dependencies.map(dep => ({ depString: dep, depth: 0 }))

  while (queue.length > 0) {
    const { depString, depth, parentKey } = queue.shift()!

    // Safety limits
    if (depth > maxDepth) continue
    if (nodes.length >= maxNodes) break

    // Parse dependency
    const parsed = parseDependencyString(depString)
    if (!parsed.isValid || !parsed.key) continue

    // Check if already visited (cycle detection)
    if (visitedKeys.has(parsed.key)) {
      // Still record parent relationship if provided
      if (parentKey) {
        if (!parentsByKey[parsed.key]) {
          parentsByKey[parsed.key] = []
        }
        if (!parentsByKey[parsed.key].includes(parentKey)) {
          parentsByKey[parsed.key].push(parentKey)
        }
        if (!childrenByKey[parentKey]) {
          childrenByKey[parentKey] = []
        }
        if (!childrenByKey[parentKey].includes(parsed.key)) {
          childrenByKey[parentKey].push(parsed.key)
        }
      }
      continue
    }

    visitedKeys.add(parsed.key)

    // Track root keys (depth 0)
    if (depth === 0) {
      rootKeys.push(parsed.key)
    }

    // Resolve package from catalog
    const packageMap = resolvePackagesByOwnerName(packageIndexUrl, [parsed.key])
    const pkg = packageMap.get(parsed.key)

    let resolvedMod: Mod | undefined = undefined
    let versionToUse: string | undefined = undefined
    let childDeps: string[] = []

    if (pkg && pkg.versions.length > 0) {
      // Choose version: required version if specified and exists, else latest
      if (parsed.requiredVersion) {
        const versionEntry = pkg.versions.find(v => v.version_number === parsed.requiredVersion)
        if (versionEntry) {
          versionToUse = parsed.requiredVersion
          childDeps = versionEntry.dependencies
        }
      }
      
      if (!versionToUse) {
        // Use latest version (first in array, as versions are sorted newest first)
        const latestVersion = pkg.versions[0]
        versionToUse = latestVersion.version_number
        childDeps = latestVersion.dependencies
      }

      resolvedMod = transformPackage(pkg, gameId)
    }

    // Compute status
    const installedVersion = resolvedMod ? installedVersions[resolvedMod.id] : undefined
    const status = computeDependencyStatus({
      parsed,
      resolvedMod: resolvedMod || null,
      installedVersion,
      enforceVersions,
    })

    // Add node
    const node: DependencyNode = {
      raw: parsed.raw,
      parsed,
      resolvedMod,
      status,
      installedVersion,
      requiredVersion: parsed.requiredVersion,
      key: parsed.key,
      depth,
    }
    nodes.push(node)

    // Track version conflicts
    if (parsed.requiredVersion) {
      if (!versionsByKey[parsed.key]) {
        versionsByKey[parsed.key] = new Set()
      }
      versionsByKey[parsed.key].add(parsed.requiredVersion)
    }

    // Record parent relationship
    if (parentKey) {
      if (!parentsByKey[parsed.key]) {
        parentsByKey[parsed.key] = []
      }
      if (!parentsByKey[parsed.key].includes(parentKey)) {
        parentsByKey[parsed.key].push(parentKey)
      }
      if (!childrenByKey[parentKey]) {
        childrenByKey[parentKey] = []
      }
      if (!childrenByKey[parentKey].includes(parsed.key)) {
        childrenByKey[parentKey].push(parsed.key)
      }
    }

    // Initialize children array for this node
    if (!childrenByKey[parsed.key]) {
      childrenByKey[parsed.key] = []
    }

    // Enqueue children
    for (const childDep of childDeps) {
      queue.push({
        depString: childDep,
        depth: depth + 1,
        parentKey: parsed.key,
      })
    }
  }

  // Detect conflicts (same package required at different versions)
  const conflicts: Array<{ key: string; versions: string[] }> = []
  for (const [key, versions] of Object.entries(versionsByKey)) {
    if (versions.size > 1) {
      conflicts.push({
        key,
        versions: Array.from(versions),
      })
    }
  }

  return {
    nodes,
    parentsByKey,
    childrenByKey,
    rootKeys,
    conflicts,
  }
}
