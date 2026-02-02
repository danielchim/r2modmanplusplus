/**
 * Parse a search query for semantic tokens.
 * 
 * Supported syntax:
 * - author:Demo → extract "Demo" as author filter
 * - author:"Demo User" → extract "Demo User" as author filter
 * - category:Tools → extract "Tools" as category filter (can have multiple)
 * - category:"Mod Loader" → extract "Mod Loader" as category filter
 * - kind:mod or kind:modpack → override section filter
 * - sort:name|updated|downloads → override sort key
 * - dir:asc|desc → override sort direction
 * 
 * Returns parsed filters and remaining text query.
 */
export interface ParsedModSearch {
  textQuery: string
  author: string | null
  categories: string[]
  kind: "mod" | "modpack" | null
  sortKey: "name" | "updated" | "downloads" | null
  sortDir: "asc" | "desc" | null
}

export function parseModSearch(query: string): ParsedModSearch {
  let remainingQuery = query
  const result: ParsedModSearch = {
    textQuery: "",
    author: null,
    categories: [],
    kind: null,
    sortKey: null,
    sortDir: null,
  }
  
  // Match author: followed by quoted string or unquoted word
  const authorRegex = /\bauthor:(?:"([^"]*)"|(\S+))/gi
  const authorMatch = authorRegex.exec(remainingQuery)
  if (authorMatch) {
    result.author = authorMatch[1] || authorMatch[2]
    remainingQuery = remainingQuery.replace(authorMatch[0], "").trim()
  }
  
  // Match category: (can appear multiple times)
  const categoryRegex = /\bcategory:(?:"([^"]*)"|(\S+))/gi
  let categoryMatch: RegExpExecArray | null
  while ((categoryMatch = categoryRegex.exec(remainingQuery)) !== null) {
    const category = categoryMatch[1] || categoryMatch[2]
    result.categories.push(category)
  }
  // Remove all category tokens
  remainingQuery = remainingQuery.replace(/\bcategory:(?:"[^"]*"|\S+)/gi, "").trim()
  
  // Match kind:mod or kind:modpack
  const kindRegex = /\bkind:(mod|modpack)\b/i
  const kindMatch = kindRegex.exec(remainingQuery)
  if (kindMatch) {
    result.kind = kindMatch[1].toLowerCase() as "mod" | "modpack"
    remainingQuery = remainingQuery.replace(kindMatch[0], "").trim()
  }
  
  // Match sort:name|updated|downloads
  const sortRegex = /\bsort:(name|updated|downloads)\b/i
  const sortMatch = sortRegex.exec(remainingQuery)
  if (sortMatch) {
    result.sortKey = sortMatch[1].toLowerCase() as "name" | "updated" | "downloads"
    remainingQuery = remainingQuery.replace(sortMatch[0], "").trim()
  }
  
  // Match dir:asc|desc
  const dirRegex = /\bdir:(asc|desc)\b/i
  const dirMatch = dirRegex.exec(remainingQuery)
  if (dirMatch) {
    result.sortDir = dirMatch[1].toLowerCase() as "asc" | "desc"
    remainingQuery = remainingQuery.replace(dirMatch[0], "").trim()
  }
  
  result.textQuery = remainingQuery
  return result
}
