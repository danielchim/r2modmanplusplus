import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, "..")

// Read version.properties
const versionPropsPath = join(rootDir, "version.properties")
const versionPropsContent = readFileSync(versionPropsPath, "utf-8")

// Parse version.properties
const props = {}
for (const line of versionPropsContent.split("\n")) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith("#")) continue
  const [key, value] = trimmed.split("=").map(s => s.trim())
  if (key && value) {
    props[key] = value
  }
}

const major = props.major || "0"
const minor = props.minor || "0"
// Build is always current Unix timestamp (not part of version string)
const build = Math.floor(Date.now() / 1000).toString()
const revision = props.revision || "0"
const mode = props.mode || "production"

// Format version: major.minor.revision (build timestamp is metadata only)
const version = `${major}.${minor}.${revision}`

// Read package.json
const packageJsonPath = join(rootDir, "package.json")
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"))

// Update version
packageJson.version = version

// Add build info to package.json
packageJson.buildInfo = {
  version,
  major,
  minor,
  build,
  revision,
  mode,
  buildTime: new Date().toISOString(),
}

// Write updated package.json
writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n")

// Update version.properties with current build timestamp
const lines = versionPropsContent.split("\n")
let hasBuildLine = false
const updatedLines = lines.map((line) => {
  const trimmed = line.trim()
  if (trimmed.startsWith("build=")) {
    hasBuildLine = true
    return `build=${build}`
  }
  return line
})

// Add build line if it doesn't exist
if (!hasBuildLine) {
  updatedLines.push(`build=${build}`)
}

writeFileSync(versionPropsPath, updatedLines.join("\n") + "\n")

console.log(`Updated package.json version to ${version} (mode: ${mode}, build: ${build})`)
