import { useCallback, useState } from 'react';

const hasStorage = typeof window !== 'undefined' && 'localStorage' in window;

function readValue<T>(key: string, fallback: T): T {
  if (!hasStorage) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeValue<T>(key: string, value: T): void {
  if (!hasStorage) {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Игнорируем ошибки записи
  }
}

// Сохранение состояния в localStorage (SSR-safe)
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): readonly [T, (next: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => readValue(key, initialValue));

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      setStoredValue((previous) => {
        const resolvedValue =
          typeof next === 'function' ? (next as (prev: T) => T)(previous) : next;

        if (Object.is(previous, resolvedValue)) {
          return previous;
        }

        writeValue(key, resolvedValue);
        return resolvedValue;
      });
    },
    [key],
  );

  return [storedValue, setValue] as const;
}
