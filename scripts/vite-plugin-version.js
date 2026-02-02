import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export function vitePluginVersion() {
  return {
    name: "vite-plugin-version",
    config(config, { command }) {
      // Read package.json to get version info during config phase
      // This ensures it's read fresh for each build
      let versionData = {
        version: "0.0.0",
        mode: "production",
        buildTime: new Date().toISOString(),
        buildInfo: {},
      }

      try {
        // Use config.root if available, otherwise fall back to process.cwd()
        const rootDir = config.root || process.cwd()
        const packageJsonPath = join(rootDir, "package.json")
        const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"))
        const buildInfo = packageJson.buildInfo || {}
        
        versionData = {
          version: buildInfo.version || packageJson.version || "0.0.0",
          mode: buildInfo.mode || "production",
          buildTime: buildInfo.buildTime || new Date().toISOString(),
          buildInfo: buildInfo,
        }

        if (command === "build") {
          console.log(`[vite-plugin-version] Injecting version: ${versionData.version} (mode: ${versionData.mode})`)
        }
      } catch (error) {
        console.warn("[vite-plugin-version] Failed to read version info:", error)
      }

      // Inject version info as environment variables during config phase
      // This ensures it's available in production builds
      return {
        define: {
          "import.meta.env.APP_VERSION": JSON.stringify(versionData.version),
          "import.meta.env.APP_MODE": JSON.stringify(versionData.mode),
          "import.meta.env.APP_BUILD_TIME": JSON.stringify(versionData.buildTime),
          "import.meta.env.APP_BUILD_INFO": JSON.stringify(versionData.buildInfo),
        },
      }
    },
  }
}
