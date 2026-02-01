/**
 * Parse a search query for semantic tokens (e.g., author:Demo).
 * 
 * Supported syntax:
 * - author:Demo → extract "Demo" as author filter
 * - author:"Demo User" → extract "Demo User" as author filter
 * 
 * Returns:
 * - textQuery: the remaining text after removing the author: token (trimmed)
 * - authorQuery: the extracted author filter, or null if not present
 */
export function parseModSearch(query: string): {
  textQuery: string
  authorQuery: string | null
} {
  // Match author: followed by quoted string or unquoted word
  // Case-insensitive key, but preserve the value casing
  const authorRegex = /\bauthor:(?:"([^"]*)"|(\S+))/i
  const match = query.match(authorRegex)
  
  if (match) {
    // Extract the author value (from either quoted or unquoted group)
    const authorQuery = match[1] || match[2]
    // Remove the matched token from the query
    const textQuery = query.replace(match[0], "").trim()
    
    return { textQuery, authorQuery }
  }
  
  // No author: token found
  return { textQuery: query, authorQuery: null }
}
