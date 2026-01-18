import { useQuery, type UseQueryResult } from "@tanstack/react-query"
import { fetchReadme, type FetchReadmeParams } from "@/lib/api/thunderstore"

/**
 * Hook to fetch and cache mod readme from Thunderstore API
 * 
 * @param params - The mod author, name, and version
 * @returns TanStack Query result with readme HTML
 */
export function useThunderstoreReadme(
  params: FetchReadmeParams
): UseQueryResult<string, Error> {
  return useQuery({
    queryKey: ["thunderstore", "readme", params.author, params.name],
    queryFn: () => fetchReadme(params),
    enabled: Boolean(params.author && params.name),
    staleTime: 1000 * 60 * 30, // 30 minutes - readmes rarely change
  })
}
