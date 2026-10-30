import { useQuery } from "@tanstack/react-query";
import { recall, remember } from "./api";

export interface Live<T> {
  data: T | undefined;
  /** The last request answered. */
  live: boolean;
  /** When `data` was fetched, in milliseconds. */
  savedAt: number | undefined;
  loading: boolean;
  error: unknown;
}

// A query whose last good answer survives a reload and an unreachable API.
export function useRemembered<T>(key: string, fetcher: () => Promise<T>, refetchMs?: number): Live<T> {
  const query = useQuery({
    queryKey: [key],
    queryFn: async () => {
      const value = await fetcher();
      remember(key, value);
      return value;
    },
    refetchInterval: refetchMs,
    retry: 1,
  });
  const saved = query.data === undefined ? recall<T>(key) : null;
  return {
    data: query.data ?? saved?.value,
    live: query.data !== undefined && !query.isError,
    savedAt: query.data !== undefined ? query.dataUpdatedAt : saved?.savedAt,
    loading: query.isLoading && !saved,
    error: query.error,
  };
}
