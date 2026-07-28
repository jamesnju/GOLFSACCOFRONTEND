import { useEffect, useRef, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface SWRConfig<T> {
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  dedupingInterval?: number;
  refreshInterval?: number;
  fallbackData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  key: string;
}

// Global cache for SWR
const swrCache = new Map<string, CacheEntry<any>>();

export function useSWR<T = any>(
  key: string | null | undefined,
  fetcher: () => Promise<T>,
  config: SWRConfig<T> = {}
) {
  const {
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
    dedupingInterval = 2000,
    refreshInterval = 0,
    fallbackData,
    onSuccess,
    onError,
  } = config;

  const { data: session } = useSession();
  const [data, setData] = useState<T | undefined>(fallbackData);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  
  const fetcherRef = useRef(fetcher);
  const keyRef = useRef(key);
  const isMounted = useRef(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isDedupingRef = useRef(false);

  // Update fetcher and key refs when they change
  useEffect(() => {
    fetcherRef.current = fetcher;
    keyRef.current = key;
  }, [fetcher, key]);

  // Check if cache is valid
  const isCacheValid = useCallback((entry: CacheEntry<T>): boolean => {
    const ttl = 5 * 60 * 1000; // 5 minutes
    return Date.now() - entry.timestamp < ttl;
  }, []);

  // Get cached data
  const getCachedData = useCallback((cacheKey: string): T | undefined => {
    const entry = swrCache.get(cacheKey);
    if (entry && isCacheValid(entry)) {
      return entry.data;
    }
    return undefined;
  }, [isCacheValid]);

  // Set cache data
  const setCachedData = useCallback((cacheKey: string, data: T) => {
    swrCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      key: cacheKey,
    });
  }, []);

  // Invalidate cache for a specific key
  const invalidateCache = useCallback((cacheKey?: string) => {
    if (cacheKey) {
      swrCache.delete(cacheKey);
    } else {
      swrCache.clear();
    }
  }, []);

  // Main fetch function
  const fetchData = useCallback(async (cacheKey: string, skipCache: boolean = false) => {
    if (!cacheKey || !fetcherRef.current) return;

    // Check cache
    if (!skipCache) {
      const cached = getCachedData(cacheKey);
      if (cached !== undefined && !isDedupingRef.current) {
        setData(cached);
        setIsLoading(false);
        setIsValidating(false);
        return;
      }
    }

    // Deduplication - prevent multiple simultaneous requests
    if (isDedupingRef.current) {
      return;
    }

    try {
      isDedupingRef.current = true;
      setIsValidating(true);
      
      const result = await fetcherRef.current();
      
      if (isMounted.current) {
        setData(result);
        setCachedData(cacheKey, result);
        setError(null);
        onSuccess?.(result);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err);
        onError?.(err);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        setIsValidating(false);
      }
      isDedupingRef.current = false;
    }
  }, [getCachedData, setCachedData, onSuccess, onError]);

  // Revalidate function
  const revalidate = useCallback(async () => {
    if (!keyRef.current) return;
    const cacheKey = typeof keyRef.current === 'string' 
      ? keyRef.current 
      : JSON.stringify(keyRef.current);
    
    await fetchData(cacheKey, true);
  }, [fetchData]);

  // Mutate function - update local data and cache
  const mutate = useCallback(async (updater: T | ((current: T | undefined) => T)) => {
    if (!keyRef.current) return;
    const cacheKey = typeof keyRef.current === 'string' 
      ? keyRef.current 
      : JSON.stringify(keyRef.current);

    let newData: T;
    if (typeof updater === 'function') {
      const currentData = getCachedData(cacheKey) || data;
      newData = (updater as (current: T | undefined) => T)(currentData);
    } else {
      newData = updater;
    }

    setData(newData);
    setCachedData(cacheKey, newData);
    await fetchData(cacheKey, true);
    
    return newData;
  }, [data, getCachedData, setCachedData, fetchData]);

  // Auto revalidate on focus
  useEffect(() => {
    if (!revalidateOnFocus || !keyRef.current) return;

    const handleFocus = () => {
      setTimeout(() => {
        if (keyRef.current) {
          revalidate();
        }
      }, 100);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [revalidateOnFocus, revalidate]);

  // Auto revalidate on reconnect
  useEffect(() => {
    if (!revalidateOnReconnect || !keyRef.current) return;

    const handleReconnect = () => {
      if (keyRef.current) {
        revalidate();
      }
    };

    window.addEventListener('online', handleReconnect);
    return () => window.removeEventListener('online', handleReconnect);
  }, [revalidateOnReconnect, revalidate]);

  // Auto revalidate on session change
  useEffect(() => {
    if (!keyRef.current) return;
    revalidate();
  }, [session, revalidate]);

  // Initial fetch
  useEffect(() => {
    isMounted.current = true;
    
    if (!keyRef.current) {
      setIsLoading(false);
      return;
    }

    const cacheKey = typeof keyRef.current === 'string' 
      ? keyRef.current 
      : JSON.stringify(keyRef.current);
    
    fetchData(cacheKey);

    return () => {
      isMounted.current = false;
    };
  }, [key, fetchData]);

  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval > 0 && keyRef.current) {
      intervalRef.current = setInterval(() => {
        revalidate();
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [refreshInterval, revalidate]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return {
    data,
    error,
    isLoading,
    isValidating,
    revalidate,
    mutate,
    invalidateCache,
  };
}

// Helper hook for paginated data
export function usePaginatedSWR<T = any>(
  key: string | null | undefined,
  fetcher: (page: number, limit: number) => Promise<T>,
  config: SWRConfig<T> & { initialPage?: number; limit?: number } = {}
) {
  const { initialPage = 1, limit = 10, ...swrConfig } = config;
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);

  const swrResult = useSWR<T>(
    key ? `${key}-page-${page}-limit-${limit}` : null,
    () => fetcher(page, limit),
    swrConfig
  );

  // Update total pages when data changes
  useEffect(() => {
    if (swrResult.data && typeof swrResult.data === 'object' && 'pagination' in swrResult.data) {
      const pagination = (swrResult.data as any).pagination;
      if (pagination?.pages) {
        setTotalPages(pagination.pages);
      }
    }
  }, [swrResult.data]);

  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  }, [page, totalPages]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  return {
    ...swrResult,
    page,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

// Helper hook for infinite scrolling - FIXED
export function useInfiniteSWR<T = any>(
  key: string | null | undefined,
  fetcher: (page: number) => Promise<T[]>,
  config: SWRConfig<T[]> & { initialPage?: number; pageSize?: number } = {}
) {
  const { initialPage = 1, pageSize = 10, ...swrConfig } = config;
  const [page, setPage] = useState(initialPage);
  const [allData, setAllData] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const swrResult = useSWR<T[]>(
    key ? `${key}-page-${page}` : null,
    () => fetcher(page),
    {
      ...swrConfig,
      onSuccess: (data: T[]) => {
        // Handle success with proper typing
        if (page === initialPage) {
          setAllData(data || []);
        } else {
          setAllData((prev) => [...prev, ...(data || [])]);
        }
        
        // Check if we have more data
        if (!data || data.length === 0 || data.length < pageSize) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
        
        // Call the original onSuccess if provided
        if (swrConfig.onSuccess) {
          swrConfig.onSuccess(data);
        }
      },
    }
  );

  const loadMore = useCallback(() => {
    if (!swrResult.isLoading && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [swrResult.isLoading, hasMore]);

  const reset = useCallback(() => {
    setPage(initialPage);
    setAllData([]);
    setHasMore(true);
    swrResult.revalidate();
  }, [initialPage, swrResult]);

  const refresh = useCallback(() => {
    setPage(initialPage);
    setAllData([]);
    setHasMore(true);
    swrResult.revalidate();
  }, [initialPage, swrResult]);

  return {
    ...swrResult,
    data: allData,
    hasMore,
    loadMore,
    reset,
    refresh,
    page,
    setPage,
  };
}

export default useSWR;