import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export function vitePluginVersion() {
  return {
    name: "vite-plugin-version",
    configResolved(config) {
      // Read package.json to get version info
      const packageJsonPath = join(config.root, "package.json")
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"))
        const buildInfo = packageJson.buildInfo || {}
        
        // Inject version info as environment variables
        config.define = config.define || {}
        config.define["import.meta.env.APP_VERSION"] = JSON.stringify(buildInfo.version || packageJson.version || "0.0.0")
        config.define["import.meta.env.APP_MODE"] = JSON.stringify(buildInfo.mode || "production")
        config.define["import.meta.env.APP_BUILD_TIME"] = JSON.stringify(buildInfo.buildTime || new Date().toISOString())
        config.define["import.meta.env.APP_BUILD_INFO"] = JSON.stringify(buildInfo)
      } catch (error) {
        console.warn("Failed to read version info:", error)
      }
    },
  }
}
