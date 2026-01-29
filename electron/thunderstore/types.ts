/**
 * Thunderstore API types (raw package listing format)
 */

/**
 * Raw package version from Thunderstore API
 */
export interface ThunderstorePackageVersion {
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

/**
 * Raw package from Thunderstore API (chunk endpoint)
 */
export interface ThunderstorePackage {
  name: string
  full_name: string
  owner: string
  package_url: string
  donation_link: string | null
  date_created: string
  date_updated: string
  uuid4: string
  rating_score: number
  is_pinned: boolean
  is_deprecated: boolean
  has_nsfw_content: boolean
  categories: string[]
  versions: ThunderstorePackageVersion[]
}

/**
 * Package listing index (from package-listing-index endpoint)
 * Contains URLs to chunk files
 */
export type PackageListingIndex = string[]

/**
 * Package listing chunk (from chunk blob URLs)
 */
export type PackageListingChunk = ThunderstorePackage[]
