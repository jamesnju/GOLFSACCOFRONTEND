// src/lib/hooks/useSWR.ts

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';

interface SWRConfig<T> {
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  revalidateIfStale?: boolean;
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
  expiresAt: number;
}

/**
 * ---------------------------------------------------------------------------
 * Global cache
 * ---------------------------------------------------------------------------
 *
 * Cache is shared between components using this hook.
 */
const swrCache = new Map<
  string,
  CacheEntry<any>
>();

/**
 * Default cache lifetime:
 * 5 minutes.
 */
const DEFAULT_TTL =
  5 * 60 * 1000;

/**
 * Requests currently being executed.
 *
 * This prevents multiple components from
 * making the same request simultaneously.
 */
const pendingRequests = new Map<
  string,
  Promise<any>
>();

// -----------------------------------------------------------------------------
// useSWR
// -----------------------------------------------------------------------------

export function useSWR<T = any>(
  key: string | null | undefined,
  fetcher: () => Promise<T>,
  config: SWRConfig<T> = {}
) {
  const {
    revalidateOnFocus = false,
    revalidateOnReconnect = false,
    revalidateIfStale = false,
    dedupingInterval = 10000,
    refreshInterval = 0,
    fallbackData,
    onSuccess,
    onError,
  } = config;

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  const [data, setData] =
    useState<T | undefined>(
      fallbackData
    );

  const [error, setError] =
    useState<any>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isValidating, setIsValidating] =
    useState(false);

  // ---------------------------------------------------------------------------
  // Refs
  // ---------------------------------------------------------------------------

  const fetcherRef =
    useRef(fetcher);

  const keyRef =
    useRef(key);

  const isMounted =
    useRef(true);

  const intervalRef =
    useRef<NodeJS.Timeout | null>(
      null
    );

  const isDedupingRef =
    useRef(false);

  const lastFetchTimeRef =
    useRef<number>(0);

  const initialFetchDoneRef =
    useRef(false);

  // ---------------------------------------------------------------------------
  // Keep latest fetcher and key
  // ---------------------------------------------------------------------------

  useEffect(() => {
    fetcherRef.current = fetcher;
    keyRef.current = key;
  }, [fetcher, key]);

  // ---------------------------------------------------------------------------
  // Cache validation
  // ---------------------------------------------------------------------------

  const isCacheValid =
    useCallback(
      (
        entry: CacheEntry<T>
      ): boolean => {
        return (
          Date.now() <
          entry.expiresAt
        );
      },
      []
    );

  // ---------------------------------------------------------------------------
  // Get cached data
  // ---------------------------------------------------------------------------

  const getCachedData =
    useCallback(
      (
        cacheKey: string
      ): T | undefined => {
        const entry =
          swrCache.get(cacheKey);

        if (
          entry &&
          isCacheValid(entry)
        ) {
          return entry.data;
        }

        /**
         * Remove expired cache.
         */
        if (entry) {
          swrCache.delete(
            cacheKey
          );
        }

        return undefined;
      },
      [isCacheValid]
    );

  // ---------------------------------------------------------------------------
  // Set cached data
  // ---------------------------------------------------------------------------

  const setCachedData =
    useCallback(
      (
        cacheKey: string,
        data: T,
        ttl: number = DEFAULT_TTL
      ) => {
        const now =
          Date.now();

        swrCache.set(
          cacheKey,
          {
            data,
            timestamp: now,
            key: cacheKey,
            expiresAt:
              now + ttl,
          }
        );
      },
      []
    );

  // ---------------------------------------------------------------------------
  // Invalidate cache
  // ---------------------------------------------------------------------------

  const invalidateCache =
    useCallback(
      (
        cacheKey?: string
      ) => {
        if (cacheKey) {
          swrCache.delete(
            cacheKey
          );

          pendingRequests.delete(
            cacheKey
          );
        } else {
          swrCache.clear();
          pendingRequests.clear();
        }
      },
      []
    );

  // ---------------------------------------------------------------------------
  // Fetch data
  // ---------------------------------------------------------------------------

  const fetchData =
    useCallback(
      async (
        cacheKey: string,
        skipCache = false
      ) => {
        if (
          !cacheKey ||
          !fetcherRef.current
        ) {
          if (isMounted.current) {
            setIsLoading(false);
            setIsValidating(false);
          }

          return;
        }

        const now =
          Date.now();

        // ---------------------------------------------------------------------
        // Deduplication interval
        // ---------------------------------------------------------------------

        if (
          !skipCache &&
          now -
            lastFetchTimeRef.current <
            dedupingInterval
        ) {
          const cached =
            getCachedData(
              cacheKey
            );

          if (
            cached !== undefined
          ) {
            if (isMounted.current) {
              setData(cached);
              setIsLoading(false);
              setIsValidating(false);
            }

            return;
          }
        }

        // ---------------------------------------------------------------------
        // Existing pending request
        // ---------------------------------------------------------------------

        const pending =
          pendingRequests.get(
            cacheKey
          );

        if (pending) {
          try {
            const result =
              await pending;

            if (
              isMounted.current
            ) {
              setData(result);
              setIsLoading(false);
              setIsValidating(false);
            }

            return;
          } catch {
            /**
             * The existing request failed.
             * Remove it so another request
             * can be attempted.
             */
            pendingRequests.delete(
              cacheKey
            );
          }
        }

        // ---------------------------------------------------------------------
        // Cache
        // ---------------------------------------------------------------------

        if (!skipCache) {
          const cached =
            getCachedData(
              cacheKey
            );

          if (
            cached !== undefined
          ) {
            if (
              isMounted.current
            ) {
              setData(cached);
              setIsLoading(false);
              setIsValidating(false);
            }

            lastFetchTimeRef.current =
              now;

            return;
          }
        }

        // ---------------------------------------------------------------------
        // Local dedupe
        // ---------------------------------------------------------------------

        if (
          isDedupingRef.current
        ) {
          return;
        }

        try {
          isDedupingRef.current =
            true;

          if (isMounted.current) {
            setIsLoading(true);
            setIsValidating(true);
          }

          lastFetchTimeRef.current =
            now;

          // -------------------------------------------------------------------
          // Execute request
          // -------------------------------------------------------------------

          const requestPromise =
            fetcherRef.current();

          pendingRequests.set(
            cacheKey,
            requestPromise
          );

          const result =
            await requestPromise;

          // -------------------------------------------------------------------
          // Store result
          // -------------------------------------------------------------------

          if (
            isMounted.current
          ) {
            setData(result);

            setCachedData(
              cacheKey,
              result
            );

            setError(null);

            onSuccess?.(
              result
            );
          }

          return result;
        } catch (err) {
          if (
            isMounted.current
          ) {
            setError(err);
            onError?.(err);
          }

          throw err;
        } finally {
          if (
            isMounted.current
          ) {
            setIsLoading(false);
            setIsValidating(false);
          }

          isDedupingRef.current =
            false;

          pendingRequests.delete(
            cacheKey
          );
        }
      },
      [
        getCachedData,
        setCachedData,
        onSuccess,
        onError,
        dedupingInterval,
      ]
    );

  // ---------------------------------------------------------------------------
  // Manual revalidate
  // ---------------------------------------------------------------------------

  const revalidate =
    useCallback(
      async () => {
        if (
          !keyRef.current
        ) {
          return;
        }

        const cacheKey =
          typeof keyRef.current ===
          'string'
            ? keyRef.current
            : JSON.stringify(
                keyRef.current
              );

        /**
         * Manual refresh should always
         * fetch fresh data.
         */
        invalidateCache(
          cacheKey
        );

        return fetchData(
          cacheKey,
          true
        );
      },
      [
        fetchData,
        invalidateCache,
      ]
    );

  // ---------------------------------------------------------------------------
  // Mutate
  // ---------------------------------------------------------------------------

  const mutate =
    useCallback(
      async (
        updater:
          | T
          | ((
              current:
                | T
                | undefined
            ) => T)
      ) => {
        if (
          !keyRef.current
        ) {
          return;
        }

        const cacheKey =
          typeof keyRef.current ===
          'string'
            ? keyRef.current
            : JSON.stringify(
                keyRef.current
              );

        let newData: T;

        if (
          typeof updater ===
          'function'
        ) {
          const currentData =
            getCachedData(
              cacheKey
            ) || data;

          newData = (
            updater as (
              current:
                | T
                | undefined
            ) => T
          )(currentData);
        } else {
          newData = updater;
        }

        setData(newData);

        setCachedData(
          cacheKey,
          newData
        );

        /**
         * Re-fetch from backend
         * after mutation.
         */
        await fetchData(
          cacheKey,
          true
        );

        return newData;
      },
      [
        data,
        getCachedData,
        setCachedData,
        fetchData,
      ]
    );

  // ---------------------------------------------------------------------------
  // Revalidate on focus
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (
      !revalidateOnFocus ||
      !keyRef.current
    ) {
      return;
    }

    let focusTimeout:
      | NodeJS.Timeout
      | null = null;

    const handleFocus = () => {
      if (focusTimeout) {
        clearTimeout(
          focusTimeout
        );
      }

      focusTimeout =
        setTimeout(() => {
          if (
            keyRef.current &&
            !isDedupingRef.current
          ) {
            revalidate();
          }
        }, 500);
    };

    window.addEventListener(
      'focus',
      handleFocus
    );

    return () => {
      window.removeEventListener(
        'focus',
        handleFocus
      );

      if (focusTimeout) {
        clearTimeout(
          focusTimeout
        );
      }
    };
  }, [
    revalidateOnFocus,
    revalidate,
  ]);

  // ---------------------------------------------------------------------------
  // Revalidate on reconnect
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (
      !revalidateOnReconnect ||
      !keyRef.current
    ) {
      return;
    }

    const handleReconnect = () => {
      if (
        keyRef.current &&
        !isDedupingRef.current
      ) {
        revalidate();
      }
    };

    window.addEventListener(
      'online',
      handleReconnect
    );

    return () => {
      window.removeEventListener(
        'online',
        handleReconnect
      );
    };
  }, [
    revalidateOnReconnect,
    revalidate,
  ]);

  // ---------------------------------------------------------------------------
  // Initial fetch
  // ---------------------------------------------------------------------------

  useEffect(() => {
    isMounted.current = true;

    if (!keyRef.current) {
      setIsLoading(false);

      return;
    }

    /**
     * Fetch once for the current key.
     *
     * We intentionally do NOT listen to session
     * changes here.
     */
    if (
      !initialFetchDoneRef.current ||
      revalidateIfStale
    ) {
      const cacheKey =
        typeof keyRef.current ===
        'string'
          ? keyRef.current
          : JSON.stringify(
              keyRef.current
            );

      /**
       * Use existing cache first.
       */
      const cached =
        getCachedData(
          cacheKey
        );

      if (
        cached !== undefined &&
        !initialFetchDoneRef.current
      ) {
        setData(cached);
        setIsLoading(false);

        initialFetchDoneRef.current =
          true;

        return;
      }

      /**
       * Fetch from backend.
       */
      fetchData(cacheKey);

      initialFetchDoneRef.current =
        true;
    }

    return () => {
      isMounted.current = false;

      if (intervalRef.current) {
        clearInterval(
          intervalRef.current
        );

        intervalRef.current =
          null;
      }
    };
  }, [
    key,
    fetchData,
    getCachedData,
    revalidateIfStale,
  ]);

  // ---------------------------------------------------------------------------
  // Refresh interval
  // ---------------------------------------------------------------------------

  useEffect(() => {
    /**
     * Only create an interval if
     * the caller explicitly requested one.
     */
    if (
      refreshInterval <= 0 ||
      !keyRef.current
    ) {
      return;
    }

    if (intervalRef.current) {
      clearInterval(
        intervalRef.current
      );
    }

    intervalRef.current =
      setInterval(() => {
        if (
          !isDedupingRef.current
        ) {
          revalidate();
        }
      }, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(
          intervalRef.current
        );

        intervalRef.current =
          null;
      }
    };
  }, [
    refreshInterval,
    revalidate,
  ]);

  // ---------------------------------------------------------------------------
  // Cleanup
  // ---------------------------------------------------------------------------

  useEffect(() => {
    return () => {
      isMounted.current = false;

      if (intervalRef.current) {
        clearInterval(
          intervalRef.current
        );

        intervalRef.current =
          null;
      }
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// usePaginatedSWR
// -----------------------------------------------------------------------------

export function usePaginatedSWR<
  T = any
>(
  key:
    | string
    | null
    | undefined,
  fetcher: (
    page: number,
    limit: number
  ) => Promise<T>,
  config: SWRConfig<T> & {
    initialPage?: number;
    limit?: number;
    ttl?: number;
  } = {}
) {
  const {
    initialPage = 1,
    limit = 10,
    ttl = DEFAULT_TTL,
    ...swrConfig
  } = config;

  const [page, setPage] =
    useState(initialPage);

  const [
    totalPages,
    setTotalPages,
  ] = useState(1);

  const [
    isLoadingMore,
    setIsLoadingMore,
  ] = useState(false);

  // ---------------------------------------------------------------------------
  // Cache key
  // ---------------------------------------------------------------------------

  const cacheKey =
    useMemo(() => {
      return key
        ? `${key}-page-${page}-limit-${limit}`
        : null;
    }, [
      key,
      page,
      limit,
    ]);

  // ---------------------------------------------------------------------------
  // Fetcher
  // ---------------------------------------------------------------------------

  const paginatedFetcher =
    useCallback(() => {
      return fetcher(
        page,
        limit
      );
    }, [
      fetcher,
      page,
      limit,
    ]);

  // ---------------------------------------------------------------------------
  // SWR
  // ---------------------------------------------------------------------------

  const swrResult =
    useSWR<T>(
      cacheKey,
      paginatedFetcher,
      swrConfig
    );

  // ---------------------------------------------------------------------------
  // Update total pages
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (
      swrResult.data &&
      typeof swrResult.data ===
        'object' &&
      'pagination' in
        swrResult.data
    ) {
      const pagination =
        (
          swrResult.data as any
        ).pagination;

      if (
        pagination?.pages
      ) {
        setTotalPages(
          pagination.pages
        );
      }
    }
  }, [
    swrResult.data,
  ]);

  // ---------------------------------------------------------------------------
  // Go to page
  // ---------------------------------------------------------------------------

  const goToPage =
    useCallback(
      (newPage: number) => {
        if (
          newPage >= 1 &&
          newPage <= totalPages &&
          newPage !== page
        ) {
          setPage(newPage);
        }
      },
      [
        totalPages,
        page,
      ]
    );

  // ---------------------------------------------------------------------------
  // Next
  // ---------------------------------------------------------------------------

  const nextPage =
    useCallback(() => {
      if (
        page < totalPages
      ) {
        setPage(
          page + 1
        );
      }
    }, [
      page,
      totalPages,
    ]);

  // ---------------------------------------------------------------------------
  // Previous
  // ---------------------------------------------------------------------------

  const prevPage =
    useCallback(() => {
      if (page > 1) {
        setPage(
          page - 1
        );
      }
    }, [page]);

  // ---------------------------------------------------------------------------
  // Refresh
  // ---------------------------------------------------------------------------

  const refresh =
    useCallback(() => {
      return swrResult.revalidate();
    }, [
      swrResult.revalidate,
    ]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    ...swrResult,

    page,

    totalPages,

    goToPage,

    nextPage,

    prevPage,

    hasNextPage:
      page < totalPages,

    hasPrevPage:
      page > 1,

    refresh,

    isLoadingMore,
  };
}

export default useSWR;