import { useCallback, useEffect, useRef, useState } from 'react';

export function useDebouncedPress(onPress: () => void, delayMs = 650) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isCoolingDown, setIsCoolingDown] = useState(false);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handlePress = useCallback(() => {
    if (isCoolingDown) {
      return;
    }

    setIsCoolingDown(true);
    onPress();

    timeoutRef.current = setTimeout(() => {
      setIsCoolingDown(false);
      timeoutRef.current = null;
    }, delayMs);
  }, [delayMs, isCoolingDown, onPress]);

  return {
    handlePress,
    isCoolingDown,
  };
}
