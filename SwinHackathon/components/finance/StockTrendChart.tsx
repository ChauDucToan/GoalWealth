import { hexToRgba } from '@/components/auth/AuthKit';
import React, { useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { Typography } from '@/constants/theme';

export function StockTrendChart({
  values,
  accent,
  labelColor,
  height = 104,
  barWidth = 10,
  labels,
}: {
  values: number[];
  accent: string;
  labelColor: string;
  height?: number;
  barWidth?: number;
  labels?: string[];
}) {
  const [width, setWidth] = useState(0);

  const points = useMemo(() => {
    if (values.length === 0 || width === 0) {
      return [];
    }

    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = Math.max(max - min, 1);
    const stepX = values.length > 1 ? width / (values.length - 1) : width;

    return values.map((value, index) => {
      const x = index * stepX;
      const normalized = (value - min) / range;
      const y = height - normalized * (height - 14) - 7;
      return { x, y, value };
    });
  }, [height, values, width]);

  const dotSize = Math.max(5, Math.min(Math.round(barWidth * 0.6), 8));

  const handleLayout = (event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;
    if (nextWidth !== width) {
      setWidth(nextWidth);
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={[styles.chartArea, { height }]} onLayout={handleLayout}>
        <View
          style={[
            styles.baseline,
            { backgroundColor: hexToRgba(accent, 0.14) },
          ]}
        />

        {points.map((point, index) => {
          const next = points[index + 1];

          if (!next) {
            return null;
          }

          const dx = next.x - point.x;
          const dy = next.y - point.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

          return (
            <View
              key={`segment-${index}`}
              style={[
                styles.segment,
                {
                  left: point.x + dx / 2 - length / 2,
                  top: point.y + dy / 2 - 1.5,
                  width: length,
                  backgroundColor: accent,
                  transform: [{ rotate: `${angle}deg` }],
                },
              ]}
            />
          );
        })}

        {points.map((point, index) => {
          const isLast = index === points.length - 1;

          return (
            <View
              key={`point-${index}`}
              style={[
                styles.dot,
                {
                  width: dotSize,
                  height: dotSize,
                  borderRadius: dotSize / 2,
                  left: point.x - dotSize / 2,
                  top: point.y - dotSize / 2,
                  backgroundColor: isLast ? accent : hexToRgba(accent, 0.9),
                  borderColor: isLast ? hexToRgba(accent, 0.18) : '#FFFFFF',
                },
              ]}
            />
          );
        })}
      </View>

      {labels?.length ? (
        <View style={styles.labelRow}>
          {labels.map((label, index) => (
            <Text key={`${label}-${index}`} style={[styles.label, { color: labelColor }]}>
              {label}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  chartArea: {
    justifyContent: 'flex-end',
  },
  baseline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 1,
  },
  segment: {
    position: 'absolute',
    height: 3,
    borderRadius: 999,
  },
  dot: {
    position: 'absolute',
    borderWidth: 2,
  },
  labelRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  label: {
    fontSize: Typography.body,
    fontWeight: '600',
  },
});
