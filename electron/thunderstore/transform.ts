/**
 * Transforms Thunderstore API packages into the app's Mod type
 */
import type { ThunderstorePackage, ThunderstorePackageVersion } from "./types"
import type { Mod, ModVersion } from "../../src/types/mod"

/**
 * Transforms a Thunderstore package version into app ModVersion format
 */
function transformVersion(version: ThunderstorePackageVersion): ModVersion {
  return {
    version_number: version.version_number,
    datetime_created: version.date_created,
    download_count: version.downloads,
    download_url: version.download_url,
    install_url: `ror2mm://v1/install/thunderstore.io/${version.full_name}/${version.version_number}/`,
  }
}

/**
 * Determines if a package is a modpack based on categories
 */
function isModpack(categories: string[]): boolean {
  return categories.some(cat => cat.toLowerCase() === "modpacks")
}

/**
 * Transforms a Thunderstore package into app Mod format
 * 
 * @param pkg - Raw Thunderstore package
 * @param gameId - Game ID to associate with this mod
 */
export function transformPackage(pkg: ThunderstorePackage, gameId: string): Mod {
  const latestVersion = pkg.versions[0]
  
  if (!latestVersion) {
    throw new Error(`Package ${pkg.full_name} has no versions`)
  }

  return {
    id: pkg.uuid4,
    gameId,
    kind: isModpack(pkg.categories) ? "modpack" : "mod",
    name: pkg.name,
    author: pkg.owner,
    description: latestVersion.description,
    version: latestVersion.version_number,
    downloads: latestVersion.downloads,
    iconUrl: latestVersion.icon,
    isInstalled: false,
    isEnabled: false,
    lastUpdated: pkg.date_updated,
    dependencies: latestVersion.dependencies || [],
    categories: pkg.categories,
    readmeHtml: "", // Fetched separately via getReadme
    versions: pkg.versions.map(transformVersion),
    packageUrl: pkg.package_url,
    websiteUrl: latestVersion.website_url || undefined,
  }
}

/**
 * Transforms multiple Thunderstore packages
 */
export function transformPackages(packages: ThunderstorePackage[], gameId: string): Mod[] {
  return packages
    .filter(pkg => pkg.versions.length > 0) // Skip packages with no versions
    .map(pkg => transformPackage(pkg, gameId))
}
