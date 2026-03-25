import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useResponsive } from './use-responsive';

export function useTabBarClearance() {
  const insets = useSafeAreaInsets();
  const { scale, verticalScale } = useResponsive();

  return useMemo(() => {
    const wrapperBottom = Math.max(insets.bottom, verticalScale(8, 0.7));
    const wrapperTop = verticalScale(8, 0.72);
    const barHeight = verticalScale(76, 0.76);
    const centerButtonHeight = scale(64, 0.76);

    const tabBarClearance = Math.ceil(wrapperBottom + wrapperTop + barHeight + 24);
    const tabBarFloatingClearance = Math.ceil(tabBarClearance + centerButtonHeight * 0.3);

    return {
      tabBarClearance,
      tabBarFloatingClearance,
    };
  }, [insets.bottom, scale, verticalScale]);
}
