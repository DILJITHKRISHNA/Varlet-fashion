import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

/**
 * Loads data whenever the screen comes into view, so it is fresh after an edit.
 * Old data stays on screen while reloading.
 */
export function useAsync<T>(load: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const latest = useRef(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const reload = useCallback(async () => {
    const call = ++latest.current;
    setLoading(true);
    try {
      const result = await load();
      if (call !== latest.current) return; // a newer request replaced this one
      setData(result);
      setError(null);
    } catch (e) {
      if (call !== latest.current) return;
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      if (call === latest.current) setLoading(false);
    }
  }, deps);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  return { data, error, loading, reload };
}
