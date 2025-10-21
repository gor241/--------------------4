import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type OnlineContextValue = {
  online: boolean;
  lastChangedAt: number | null;
};

const OnlineContext = createContext<OnlineContextValue | undefined>(undefined);

export type OnlineProviderProps = {
  children: ReactNode;
};

export function OnlineProvider({ children }: OnlineProviderProps): JSX.Element {
  const initialOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  const [online, setOnline] = useState<boolean>(initialOnline);
  const [lastChangedAt, setLastChangedAt] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleOnline = () => {
      setOnline(true);
      setLastChangedAt(Date.now());
    };

    const handleOffline = () => {
      setOnline(false);
      setLastChangedAt(Date.now());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const value = useMemo<OnlineContextValue>(
    () => ({ online, lastChangedAt }),
    [online, lastChangedAt],
  );

  return <OnlineContext.Provider value={value}>{children}</OnlineContext.Provider>;
}

export function useOnlineStatus(): OnlineContextValue {
  const context = useContext(OnlineContext);

  if (!context) {
    throw new Error('useOnlineStatus must be used within an OnlineProvider');
  }

  return context;
}
