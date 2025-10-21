import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { fetchRates, getRatesSource } from '@/api/ratesService';
import type { RatesResponse } from '@/api/ratesService';
import {
  DEFAULT_CACHE_TTL,
  isExpired,
  readRatesCache,
  writeRatesCache,
} from '@/lib/cache';
import type { RatesCacheEntry } from '@/lib/cache';

type HookState = {
  data: RatesResponse | null;
  updatedAt: number | null;
  loading: boolean;
  error: string | null;
};

const INITIAL_STATE: HookState = {
  data: null,
  updatedAt: null,
  loading: true,
  error: null,
};

type FetchOptions = {
  forceLoading?: boolean;
  offlineMessage?: string;
};

/**
 * Manage FX rates with cache-first logic and optional background refresh when stale.
 * The hook reads cached data, surfaces it immediately, and refreshes from the network
 * when online and the cached payload is expired. Manual reload is exposed via `reload`.
 */
export function useExchangeRates(online: boolean): {
  data: RatesResponse | null;
  updatedAt: number | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
} {
  const [state, setState] = useState<HookState>(INITIAL_STATE);
  const inFlightRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const setData = useCallback((payload: RatesResponse, timestamp: number) => {
    setState((prev) => {
      if (
        prev.data === payload &&
        prev.updatedAt === timestamp &&
        prev.loading === false &&
        prev.error === null
      ) {
        return prev;
      }

      return {
        data: payload,
        updatedAt: timestamp,
        loading: false,
        error: null,
      };
    });
  }, []);

  const setError = useCallback((message: string) => {
    setState((prev) => {
      if (prev.error === message && prev.loading === false) {
        return prev;
      }

      return {
        ...prev,
        loading: false,
        error: message,
      };
    });
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => {
      if (prev.error === null) {
        return prev;
      }

      return {
        ...prev,
        error: null,
      };
    });
  }, []);

  const runFetch = useCallback(
    async (options: FetchOptions = {}) => {
      if (inFlightRef.current) {
        return;
      }

      if (!online) {
        if (options.offlineMessage) {
          setError(options.offlineMessage);
        }
        return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      inFlightRef.current = true;

      if (options.forceLoading) {
        setState((prev) => {
          if (prev.loading && prev.error === null) {
            return prev;
          }

          return {
            ...prev,
            loading: true,
            error: null,
          };
        });
      } else {
        clearError();
      }

      try {
        const payload = await fetchRates(abortControllerRef.current.signal);
        const timestamp = Date.now();

        writeRatesCache(payload, { api: getRatesSource() });
        setData(payload, timestamp);
      } catch (error) {
        if (error instanceof Error && error.message === 'Request cancelled') {
          return;
        }

        const message = error instanceof Error ? error.message : 'Failed to fetch rates';
        setError(message);
      } finally {
        inFlightRef.current = false;
        abortControllerRef.current = null;
      }
    },
    [clearError, online, setData, setError],
  );

  const applyCache = useCallback(
    (cache: RatesCacheEntry) => {
      setData(cache.payload, cache.timestamp);
    },
    [setData],
  );

  useEffect(() => {
    const cache = readRatesCache();

    if (cache) {
      applyCache(cache);

      if (online && isExpired(cache.timestamp, DEFAULT_CACHE_TTL)) {
        void runFetch();
      }

      return;
    }

    if (!online) {
      setError('No network and no cached rates.');
      return;
    }

    void runFetch({ forceLoading: true });
  }, [applyCache, online, runFetch, setError]);

  const reload = useCallback(async () => {
    await runFetch({ forceLoading: true, offlineMessage: 'Offline: cannot refresh' });
  }, [runFetch]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return useMemo(
    () => ({
      data: state.data,
      updatedAt: state.updatedAt,
      loading: state.loading,
      error: state.error,
      reload,
    }),
    [reload, state.data, state.error, state.loading, state.updatedAt],
  );
}
