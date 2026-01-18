import { MOD_CATEGORIES } from "./mod-categories"
import { BONELAB_MODS } from "./bonelab-mods"

export type ModVersion = {
  version_number: string
  datetime_created: string
  download_count: number
  download_url: string
  install_url: string
}

export type Mod = {
  id: string
  gameId: string
  kind: "mod" | "modpack"
  name: string
  author: string
  description: string
  version: string
  downloads: number
  iconUrl: string
  isInstalled: boolean
  isEnabled: boolean
  lastUpdated: string
  dependencies: string[]
  categories: string[]
  readmeHtml: string
  versions: ModVersion[]
}

const generateMods = (gameId: string, count: number, kind: "mod" | "modpack" = "mod"): Mod[] => {
  const modNames = [
    "BepInEx", "R2API", "TooManyFriends", "BiggerLobby", "SkillsPlusPlus",
    "ItemStats", "FastScrap", "MoreCompany", "LateCompany", "ShipLoot",
    "ReservedItemSlot", "FlashlightToggle", "LethalExpansion", "Diversity",
    "TerminalApi", "HookGenPatcher", "CustomSounds", "MoreItems", "BetterStamina"
  ]
  
  const modpackNames = [
    "Essential Pack", "Performance Bundle", "QoL Collection", "Graphics Overhaul",
    "Multiplayer Pack", "Content Expansion", "Balanced Gameplay", "Survival Plus"
  ]
  
  const names = kind === "modpack" ? modpackNames : modNames
  const authors = ["bbepis", "tristanmcpherson", "RiskofThunder", "mistername", 
                   "XoXFaby", "Evaisa", "anormaltwig", "notnotnotswipez"]
  
  // Helper to pick random categories
  const pickCategories = (min: number, max: number): string[] => {
    const count = Math.floor(Math.random() * (max - min + 1)) + min
    const shuffled = [...MOD_CATEGORIES].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }

  const sampleReadmeHtml = `<h1>FusionNetworking+</h1>
<h3>A mod which adds more network layers to Fusion! (Currently adds RiptideNetworking)</h3>
<h1>How to Use the Mod</h1>
<p>When logging into a network layer in Fusion, cycle to the desired layer.</p>
<h1>Currently Added Network Layers (Only one for now):</h1>
<h2>Riptide</h2>
<p>Using <a href="https://github.com/RiptideNetworking/Riptide">Riptide Networking</a>, a lightweight, server authoritative P2P networking library, this network layer can be used without any external programs like Steam/FusionHelper, allowing the Quest to connect to other players fully standalone!</p>
<h3>There ARE some caveats, however:</h3>
<ul>
<li>Of course, users on the Riptide layer CANNOT play with users on the Steam layer.</li>
<li>Due to the nature of P2P, public lobbies are NOT included with the Riptide layer.</li>
<li>In order for one to host a Riptide lobby, they must open a port in some way to outside players. (unless the two are on the same network/WIFI)</li>
<li>Relating to that, in order to let others join the host, the host must share a "server code," which is their IP Address encoded into a string of letters. Do NOT share this code willy nilly, unless you are using a VPN of some kind or are comfortable sharing your IP.</li>
</ul>
<h3>Riptide Layer Additions:</h3>
<ul>
<li>Ping display to Fusion UI, which shows the quality of your connection.</li>
<li>Server codes are automatically copied to your clipboard when refreshed, due to their length.</li>
</ul>`

  return Array.from({ length: count }, (_, i) => {
    const name = names[i % names.length] + (i >= names.length ? ` ${Math.floor(i / names.length) + 1}` : "")
    const author = authors[i % authors.length]
    const currentVersion = `${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 100)}`
    
    // Generate 3-5 versions per mod
    const versionCount = Math.floor(Math.random() * 3) + 3
    const versions: ModVersion[] = Array.from({ length: versionCount }, (_, vIndex) => {
      const major = Math.max(1, parseInt(currentVersion.split(".")[0]) - Math.floor(vIndex / 3))
      const minor = vIndex === 0 ? parseInt(currentVersion.split(".")[1]) : Math.floor(Math.random() * 10)
      const patch = vIndex === 0 ? parseInt(currentVersion.split(".")[2]) : Math.floor(Math.random() * 100)
      const versionNumber = vIndex === 0 ? currentVersion : `${major}.${minor}.${patch}`
      
      const daysAgo = vIndex * (Math.floor(Math.random() * 30) + 10)
      const datetime = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()
      
      // Latest version has most downloads, older versions have progressively fewer
      const baseDownloads = Math.floor(Math.random() * 1000000) + 10000
      const downloadMultiplier = vIndex === 0 ? 1 : Math.max(0.1, 1 - (vIndex * 0.2))
      const downloads = Math.floor(baseDownloads * downloadMultiplier)
      
      return {
        version_number: versionNumber,
        datetime_created: datetime,
        download_count: downloads,
        download_url: `https://thunderstore.io/package/download/${author}/${name}/${versionNumber}/`,
        install_url: `ror2mm://v1/install/thunderstore.io/${author}/${name}/${versionNumber}/`
      }
    })
    
    return {
      id: `${gameId}-${kind}-${i}`,
      gameId,
      kind,
      name,
      author,
      description: kind === "modpack" 
        ? `A curated collection of mods that work together to enhance your ${gameId} experience.`
        : `A comprehensive mod that enhances the ${gameId} experience with additional features and quality of life improvements.`,
      version: currentVersion,
      downloads: versions[0].download_count,
      iconUrl: `https://via.placeholder.com/256x256/${["ef4444", "f59e0b", "10b981", "3b82f6", "8b5cf6", "ec4899"][i % 6]}/ffffff?text=${names[i % names.length].substring(0, 2)}`,
      isInstalled: Math.random() > 0.5,
      isEnabled: Math.random() > 0.3,
      lastUpdated: versions[0].datetime_created,
      dependencies: i === 0 ? [] : i === 1 ? ["BepInEx"] : ["BepInEx", "R2API"],
      categories: pickCategories(1, 3),
      readmeHtml: sampleReadmeHtml.replace("FusionNetworking+", name),
      versions
    }
  })
}

export const MODS: Mod[] = [
  ...BONELAB_MODS,
  ...generateMods("ror2", 100, "mod"),
  ...generateMods("ror2", 20, "modpack"),
  ...generateMods("valheim", 65, "mod"),
  ...generateMods("valheim", 15, "modpack"),
  ...generateMods("lethal-company", 80, "mod"),
  ...generateMods("lethal-company", 20, "modpack"),
  ...generateMods("dyson-sphere", 40, "mod"),
  ...generateMods("dyson-sphere", 10, "modpack"),
]
