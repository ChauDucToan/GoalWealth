import { useResponsive } from '@/hooks/use-responsive';
import React, { useMemo } from 'react';
import { DimensionValue, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

type ResponsiveGridProps = {
  children: React.ReactNode;
  minItemWidth?: number;
  gap?: number;
  maxColumns?: number;
  horizontalPadding?: number;
  maxContentWidth?: number;
  style?: StyleProp<ViewStyle>;
  itemStyle?: StyleProp<ViewStyle>;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function ResponsiveGrid({
  children,
  minItemWidth = 144,
  gap = 12,
  maxColumns = 4,
  horizontalPadding = 0,
  maxContentWidth,
  style,
  itemStyle,
}: ResponsiveGridProps) {
  const { width } = useResponsive();
  const items = React.Children.toArray(children);
  const containerWidth = maxContentWidth
    ? Math.min(Math.max(width - horizontalPadding * 2, 0), maxContentWidth)
    : Math.max(width - horizontalPadding * 2, 0);

  const columns = useMemo(() => {
    const availableWidth = Math.max(containerWidth, minItemWidth);
    const computedColumns = Math.floor((availableWidth + gap) / (minItemWidth + gap));

    return clamp(computedColumns, 1, maxColumns);
  }, [containerWidth, gap, maxColumns, minItemWidth]);

  const itemWidth: DimensionValue = `${100 / columns}%`;

  return (
    <View style={[styles.wrapper, maxContentWidth ? { maxWidth: maxContentWidth } : null]}>
      <View style={[styles.grid, { marginHorizontal: -gap / 2, marginBottom: -gap }, style]}>
        {items.map((child, index) => {
          const key =
            React.isValidElement(child) && child.key != null ? String(child.key) : `grid-item-${index}`;

          return (
            <View
              key={key}
              style={[
                styles.item,
                {
                  width: itemWidth,
                  paddingHorizontal: gap / 2,
                  marginBottom: gap,
                },
                itemStyle,
              ]}
            >
              {child}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignSelf: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  item: {
    minWidth: 0,
  },
});
