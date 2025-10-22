import { useEffect, useState } from 'react';

// Дебаунс значения: пересчёт через delayMs
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
