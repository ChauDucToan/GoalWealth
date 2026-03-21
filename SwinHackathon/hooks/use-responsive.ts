import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function round(value: number) {
  return Number(value.toFixed(2));
}

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const widthRatio = clamp(width / BASE_WIDTH, 0.88, 1.18);
    const heightRatio = clamp(height / BASE_HEIGHT, 0.9, 1.12);
    const blendedRatio = Math.min(widthRatio, heightRatio);

    const scale = (size: number, factor = 0.65) =>
      round(size + (size * widthRatio - size) * factor);
    const verticalScale = (size: number, factor = 0.65) =>
      round(size + (size * heightRatio - size) * factor);
    const scaleFont = (size: number, factor = 0.72) =>
      round(size + (size * blendedRatio - size) * factor);

    return {
      width,
      height,
      isCompact: width < 360 || height < 760,
      isTablet: width >= 768,
      scale,
      verticalScale,
      scaleFont,
    };
  }, [height, width]);
}
