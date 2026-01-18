/**
 * Thunderstore API client for fetching mod data
 */

export interface FetchReadmeParams {
  author: string
  name: string
}

/**
 * Fetches the readme HTML for a specific mod version from Thunderstore
 * 
 * @param params - The mod author, name, and version
 * @returns The readme HTML content
 * @throws Error if the fetch fails or returns non-OK status
 */
export async function fetchReadme({ author, name }: FetchReadmeParams): Promise<string> {
  // Use proxy in development to avoid CORS issues
  const baseUrl = import.meta.env.DEV 
    ? '/api/thunderstore' 
    : 'https://thunderstore.io/api/cyberstorm'
  
  const url = `${baseUrl}/package/${author}/${name}/latest/readme/`
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'text/html,application/json,text/plain',
    },
  })
  
  if (!response.ok) {
    throw new Error(`Failed to fetch readme: ${response.status} ${response.statusText}`)
  }
  
  const contentType = response.headers.get('content-type')
  
  // Handle JSON response (API might return { readme: "..." })
  if (contentType?.includes('application/json')) {
    const data = await response.json()
    return data.html
  }
  
  // Handle plain text/HTML response
  return await response.text()
}
