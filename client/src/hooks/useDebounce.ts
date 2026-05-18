import { useEffect, useState } from 'react';

export const useDebounce = <T,>(value: T, delay = 450): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timeout);
  }, [delay, value]);

  return debounced;
};
