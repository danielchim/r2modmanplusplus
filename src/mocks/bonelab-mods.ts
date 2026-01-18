import type { Mod, ModVersion } from "./mods"
import sampleModsJson from "./sample_mods.json"

// Thunderstore package format from API
type ThunderstorePackage = {
  name: string
  full_name: string
  owner: string
  package_url: string
  date_created: string
  date_updated: string
  uuid4: string
  rating_score: number
  is_pinned: boolean
  is_deprecated: boolean
  has_nsfw_content: boolean
  categories: string[]
  versions: ThunderstoreVersion[]
}

type ThunderstoreVersion = {
  name: string
  full_name: string
  description: string
  icon: string
  version_number: string
  dependencies: string[]
  download_url: string
  downloads: number
  date_created: string
  website_url: string
  is_active: boolean
  uuid4: string
  file_size: number
}

// Map Thunderstore categories to our UI categories
const CATEGORY_MAP: Record<string, string> = {
  "Code Mods": "Frameworks",
  "Cosmetics": "Cosmetic",
  "Cosmetic": "Cosmetic",
  "Items": "Items",
  "Weapons": "Weapons",
  "Maps": "Content",
  "Audio": "Audio",
  "Libraries": "Libraries",
  "Tools": "Tools",
  "Gameplay": "Gameplay",
  "Graphics": "Graphics",
  "Performance": "Performance",
  "UI": "UI",
  "Multiplayer": "Multiplayer",
  "Server-side": "Server-side",
  "Client-side": "Client-side",
}

function mapThunderstoreCategories(tsCategories: string[]): string[] {
  if (!tsCategories || tsCategories.length === 0) {
    return ["Misc"]
  }
  
  const mapped = tsCategories.map(cat => CATEGORY_MAP[cat] || "Misc")
  return [...new Set(mapped)] // deduplicate
}

function transformThunderstorePackageToMod(pkg: ThunderstorePackage): Mod {
  const latestVersion = pkg.versions[0]
  
  // Sum all version downloads (as requested: "all versions")
  const totalDownloads = pkg.versions.reduce((sum, v) => sum + v.downloads, 0)
  
  // Map versions to our ModVersion format
  const versions: ModVersion[] = pkg.versions.map(v => ({
    version_number: v.version_number,
    datetime_created: v.date_created,
    download_count: v.downloads,
    download_url: v.download_url,
    install_url: v.download_url, // Can be enhanced later with ror2mm:// style links
  }))
  
  // Generate simple README HTML since JSON doesn't include it
  const readmeHtml = `
    <h1>${pkg.name}</h1>
    <p>${latestVersion?.description || "No description available."}</p>
    <h2>Links</h2>
    <ul>
      <li><a href="${pkg.package_url}" target="_blank">View on Thunderstore</a></li>
      ${latestVersion?.website_url ? `<li><a href="${latestVersion.website_url}" target="_blank">Project Website</a></li>` : ""}
    </ul>
    <h2>Stats</h2>
    <ul>
      <li>Rating: ${pkg.rating_score}</li>
      <li>Total Downloads: ${totalDownloads.toLocaleString()}</li>
      <li>Last Updated: ${new Date(pkg.date_updated).toLocaleDateString()}</li>
    </ul>
  `.trim()
  
  return {
    id: pkg.uuid4,
    gameId: "bonelab",
    kind: "mod",
    name: pkg.name,
    author: pkg.owner,
    description: latestVersion?.description || "",
    version: latestVersion?.version_number || "0.0.0",
    downloads: totalDownloads,
    iconUrl: latestVersion?.icon || "",
    isInstalled: Math.random() > 0.5,
    isEnabled: Math.random() > 0.5,
    lastUpdated: pkg.date_updated,
    dependencies: latestVersion?.dependencies || [],
    categories: mapThunderstoreCategories(pkg.categories),
    readmeHtml,
    versions,
  }
}

// Transform the imported JSON
export const BONELAB_MODS: Mod[] = (sampleModsJson as ThunderstorePackage[]).map(
  transformThunderstorePackageToMod
)
