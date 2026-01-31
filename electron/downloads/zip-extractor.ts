/**
 * Zip extraction with Zip Slip protection
 */
import yauzl from "yauzl"
import { promises as fs } from "fs"
import { join, dirname } from "path"
import { pipeline } from "stream/promises"
import { isPathSafe, ensureDir } from "./fs-utils"

/**
 * Extracts a zip file to a destination directory with Zip Slip protection
 * 
 * @param zipPath - Path to zip file
 * @param destDir - Destination directory for extracted files
 * @throws Error if extraction fails or if any entry attempts to escape destDir
 */
export async function extractZip(zipPath: string, destDir: string): Promise<void> {
  await ensureDir(destDir)
  
  return new Promise((resolve, reject) => {
    yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
      if (err) {
        return reject(new Error(`Failed to open zip file: ${err.message}`))
      }
      
      if (!zipfile) {
        return reject(new Error("Failed to open zip file: zipfile is undefined"))
      }
      
      let errorOccurred = false
      
      zipfile.on("entry", (entry) => {
        if (errorOccurred) return
        
        // Validate path safety (Zip Slip protection)
        if (!isPathSafe(destDir, entry.fileName)) {
          errorOccurred = true
          zipfile.close()
          return reject(new Error(`Unsafe zip entry detected: ${entry.fileName} attempts to escape extraction directory`))
        }
        
        const fullPath = join(destDir, entry.fileName)
        
        // Handle directories
        if (entry.fileName.endsWith("/")) {
          ensureDir(fullPath)
            .then(() => zipfile.readEntry())
            .catch((error) => {
              errorOccurred = true
              zipfile.close()
              reject(error)
            })
          return
        }
        
        // Extract file
        zipfile.openReadStream(entry, (err, readStream) => {
          if (err) {
            errorOccurred = true
            zipfile.close()
            return reject(new Error(`Failed to read zip entry ${entry.fileName}: ${err.message}`))
          }
          
          if (!readStream) {
            errorOccurred = true
            zipfile.close()
            return reject(new Error(`Failed to read zip entry ${entry.fileName}: readStream is undefined`))
          }
          
          // Ensure parent directory exists
          ensureDir(dirname(fullPath))
            .then(async () => {
              const writeStream = await fs.open(fullPath, "w")
              
              try {
                await pipeline(readStream, writeStream.createWriteStream())
                await writeStream.close()
                zipfile.readEntry()
              } catch (error) {
                errorOccurred = true
                await writeStream.close()
                zipfile.close()
                reject(error)
              }
            })
            .catch((error) => {
              errorOccurred = true
              zipfile.close()
              reject(error)
            })
        })
      })
      
      zipfile.on("end", () => {
        if (!errorOccurred) {
          resolve()
        }
      })
      
      zipfile.on("error", (error) => {
        if (!errorOccurred) {
          errorOccurred = true
          reject(error)
        }
      })
      
      // Start reading entries
      zipfile.readEntry()
    })
  })
}
