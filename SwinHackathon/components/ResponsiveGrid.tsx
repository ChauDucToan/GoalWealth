import { useResponsive } from '@/hooks/use-responsive';
import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

type ResponsiveGridProps = {
  children: React.ReactNode;
  minItemWidth?: number;
  gap?: number;
  maxColumns?: number;
  horizontalPadding?: number;
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
  style,
  itemStyle,
}: ResponsiveGridProps) {
  const { width } = useResponsive();
  const items = React.Children.toArray(children);

  const columns = useMemo(() => {
    const availableWidth = Math.max(width - horizontalPadding * 2, minItemWidth);
    const computedColumns = Math.floor((availableWidth + gap) / (minItemWidth + gap));

    return clamp(computedColumns, 1, maxColumns);
  }, [gap, horizontalPadding, maxColumns, minItemWidth, width]);

  const itemWidth = `${100 / columns}%`;

  return (
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
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  item: {
    minWidth: 0,
  },
});
