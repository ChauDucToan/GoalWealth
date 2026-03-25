import { useCallback, useEffect, useRef, useState } from 'react';

const SETUP_NAVIGATION_DEBOUNCE_MS = 700;

export function useSetupNavigationDebounce(delay = SETUP_NAVIGATION_DEBOUNCE_MS) {
  const [isNavigating, setIsNavigating] = useState(false);
  const lockRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runNavigation = useCallback(
    (action: () => void) => {
      if (lockRef.current) {
        return;
      }

      lockRef.current = true;
      setIsNavigating(true);
      action();

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        lockRef.current = false;
        setIsNavigating(false);
        timeoutRef.current = null;
      }, delay);
    },
    [delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isNavigating,
    runNavigation,
  };
}
