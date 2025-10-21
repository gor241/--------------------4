import { useEffect, useState } from 'react';

/**
 * Return a debounced version of the provided value.
 * @example
 * const debouncedQuery = useDebouncedValue(query, 300);
 */
export function useDebouncedValue<T>(value: T, delayMs: number = 250): T {
  const isImmediate = !Number.isFinite(delayMs) || delayMs <= 0;
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    if (isImmediate) {
      setDebouncedValue(value);
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [value, delayMs, isImmediate]);

  return isImmediate ? value : debouncedValue;
}
