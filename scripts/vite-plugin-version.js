import { readFileSync } from "fs"
import { join } from "path"
import semver from "semver"

export function vitePluginVersion() {
  return {
    name: "vite-plugin-version",
    config(config, { command }) {
      let versionData = {
        version: "0.0.0",
        major: "0",
        minor: "0",
        revision: "0",
        build: Math.floor(Date.now() / 1000).toString(),
        mode: "production",
        buildTime: new Date().toISOString(),
      }

      try {
        const rootDir = config.root || process.cwd()
        const packageJsonPath = join(rootDir, "package.json")
        const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"))

        // Parse version using semver
        const parsed = semver.parse(packageJson.version) || semver.parse("0.0.0")
        const version = parsed.version
        const major = String(parsed.major)
        const minor = String(parsed.minor)
        const revision = String(parsed.patch)

        // Generate build info at build time (in-memory only, no file writes)
        const build = Math.floor(Date.now() / 1000).toString()
        const buildTime = new Date().toISOString()
        const mode = process.env.BUILD_MODE || "production"

        versionData = { version, major, minor, revision, build, mode, buildTime }

        if (command === "build") {
          console.log(`[vite-plugin-version] Injecting version: ${version} (mode: ${mode}, build: ${build})`)
        }
      } catch (error) {
        console.warn("[vite-plugin-version] Failed to read version info:", error)
      }

      return {
        define: {
          "import.meta.env.APP_VERSION": JSON.stringify(versionData.version),
          "import.meta.env.APP_MODE": JSON.stringify(versionData.mode),
          "import.meta.env.APP_BUILD_TIME": JSON.stringify(versionData.buildTime),
          "import.meta.env.APP_BUILD_INFO": JSON.stringify(versionData),
        },
      }
    },
  }
}
