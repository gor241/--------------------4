import { useCallback, useEffect, useState } from 'react';

type Serializer<T> = {
  read: (value: string | null) => T;
  write: (value: T) => string;
};

const defaultSerializer: Serializer<unknown> = {
  read: (value) => (value === null ? null : JSON.parse(value)),
  write: (value) => JSON.stringify(value),
};

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  serializer: Serializer<T> = defaultSerializer as Serializer<T>,
): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored === null) {
        return initialValue;
      }
      return serializer.read(stored);
    } catch (error) {
      console.warn(`Failed to read localStorage key "${key}"`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, serializer.write(state));
    } catch (error) {
      console.warn(`Failed to write localStorage key "${key}"`, error);
    }
  }, [key, serializer, state]);

  const store = useCallback((value: T) => {
    setState(value);
  }, []);

  return [state, store];
}
