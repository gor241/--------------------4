import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_CACHE_TTL,
  RATES_CACHE_KEY,
  clearRatesCache,
  isExpired,
  readRatesCache,
  writeRatesCache,
} from '../../src/lib/cache';

const payload = {
  base: 'EUR',
  rates: { USD: 1.1 },
};

function createMockStorage() {
  const store = new Map<string, string>();

  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    }),
    key: vi.fn((index: number) => Array.from(store.keys())[index] ?? null),
    get length() {
      return store.size;
    },
  } as unknown as Storage;
}

describe('rates cache helpers', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: createMockStorage(),
      configurable: true,
      writable: true,
    });
  });

  it('persists and retrieves cache entries roundtrip', () => {
    const writeResult = writeRatesCache(payload, { api: 'vats' });
    const entry = readRatesCache();

    expect(writeResult).toBe(true);
    expect(entry).not.toBeNull();
    expect(entry?.payload).toEqual(payload);
    expect(entry?.api).toBe('vats');
    expect(typeof entry?.timestamp).toBe('number');
  });

  it('returns null for malformed JSON or missing data', () => {
    // missing key
    expect(readRatesCache()).toBeNull();

    // malformed JSON
    globalThis.localStorage?.setItem(RATES_CACHE_KEY, '{ broken json ');
    expect(readRatesCache()).toBeNull();

    // missing required fields
    globalThis.localStorage?.setItem(
      RATES_CACHE_KEY,
      JSON.stringify({ timestamp: Date.now() }),
    );
    expect(readRatesCache()).toBeNull();
  });

  it('marks entries expired when timestamp beyond TTL', () => {
    const now = 10_000;
    const oldTimestamp = now - DEFAULT_CACHE_TTL - 1;

    expect(isExpired(oldTimestamp, DEFAULT_CACHE_TTL, now)).toBe(true);
  });

  it('does not expire entries within TTL window', () => {
    const now = 10_000;
    const recentTimestamp = now - DEFAULT_CACHE_TTL + 1;

    expect(isExpired(recentTimestamp, DEFAULT_CACHE_TTL, now)).toBe(false);
  });

  it('clears cache key safely', () => {
    writeRatesCache(payload);
    const result = clearRatesCache();

    expect(result).toBe(true);
    expect(globalThis.localStorage?.getItem(RATES_CACHE_KEY)).toBeNull();
  });

  it('handles missing localStorage gracefully', () => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    expect(writeRatesCache(payload)).toBe(false);
    expect(readRatesCache()).toBeNull();
    expect(clearRatesCache()).toBe(false);
  });
});
