import { hexToRgba } from '@/components/auth/AuthKit';
import { Typography } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';
import { useTheme } from '@/hooks/use-theme-colors';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabRouteName =
  | 'home'
  | 'transactions'
  | 'assistant'
  | 'profile'
  | 'insights'
  | 'achievements'
  | 'news-resources'
  | 'search-notifications';

const primaryTabs: TabRouteName[] = ['home', 'transactions', 'assistant', 'profile'];
const overflowTabs: TabRouteName[] = ['insights', 'achievements', 'news-resources', 'search-notifications'];

const routeMeta: Record<
  TabRouteName,
  {
    label: string;
    icon: React.ComponentProps<typeof MaterialIcons>['name'];
  }
> = {
  home: { label: 'Home', icon: 'home-filled' },
  transactions: { label: 'Transactions', icon: 'receipt-long' },
  assistant: { label: 'Assistant', icon: 'smart-toy' },
  profile: { label: 'Profile', icon: 'person-outline' },
  insights: { label: 'Insights', icon: 'bar-chart' },
  achievements: { label: 'Achievements', icon: 'emoji-events' },
  'news-resources': { label: 'Community', icon: 'groups' },
  'search-notifications': { label: 'Search', icon: 'search' },
};

export function AppTabBar({ state, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const { scale, verticalScale, scaleFont } = useResponsive();
  const insets = useSafeAreaInsets();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const currentRouteName = state.routes[state.index]?.name as TabRouteName;
  const isOverflowActive = overflowTabs.includes(currentRouteName);

  useEffect(() => {
    setIsMoreOpen(false);
  }, [currentRouteName]);

  const routesByName = useMemo(
    () => new Map(state.routes.map((route) => [route.name as TabRouteName, route])),
    [state.routes]
  );

  const navigateTo = (name: TabRouteName) => {
    setIsMoreOpen(false);
    const route = routesByName.get(name);

    if (!route) {
      return;
    }

    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      navigation.navigate(name as never);
    }
  };

  const renderPrimaryTab = (name: TabRouteName) => {
    const active = currentRouteName === name;
    const meta = routeMeta[name];

    return (
      <Pressable
        key={name}
        onPress={() => navigateTo(name)}
        style={styles.tabButton}
      >
        <View
          style={[
            styles.iconShell,
            {
              backgroundColor: active ? colors.primaryLight : colors.card,
              borderColor: active ? hexToRgba(colors.primaryDark, 0.16) : colors.border,
              width: scale(46, 0.76),
              height: scale(46, 0.76),
              borderRadius: scale(23, 0.72),
            },
          ]}
        >
          <MaterialIcons
            name={meta.icon}
            size={scale(24, 0.72)}
            color={active ? colors.primaryDark : hexToRgba(colors.text, 0.4)}
          />
        </View>
      </Pressable>
    );
  };

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingBottom: Math.max(insets.bottom, verticalScale(8, 0.7)),
          paddingHorizontal: scale(18, 0.8),
          paddingTop: verticalScale(8, 0.72),
        },
      ]}
    >
      {isMoreOpen ? (
        <View
          style={[
            styles.morePanel,
            {
              backgroundColor: colors.card,
              borderColor: hexToRgba(colors.primaryDark, 0.08),
              shadowColor: colors.shadow,
              bottom: Math.max(insets.bottom, verticalScale(8, 0.7)) + verticalScale(92, 0.72),
              left: scale(18, 0.8),
              right: scale(18, 0.8),
              borderRadius: scale(24, 0.74),
              padding: scale(12, 0.76),
            },
          ]}
        >
          {overflowTabs.map((name) => {
            const active = currentRouteName === name;
            const meta = routeMeta[name];

            return (
              <Pressable
                key={name}
                onPress={() => navigateTo(name)}
                style={[
                  styles.moreItem,
                  {
                    backgroundColor: colors.card,
                    borderColor: active ? hexToRgba(colors.primaryDark, 0.18) : colors.border,
                    borderRadius: scale(18, 0.72),
                    paddingHorizontal: scale(12, 0.78),
                    paddingVertical: verticalScale(12, 0.76),
                  },
                ]}
              >
                <View
                  style={[
                    styles.moreIconShell,
                    {
                      backgroundColor: active ? colors.primaryLight : colors.backgroundSoft,
                      width: scale(38, 0.72),
                      height: scale(38, 0.72),
                      borderRadius: scale(14, 0.72),
                    },
                  ]}
                >
                  <MaterialIcons
                    name={meta.icon}
                    size={scale(20, 0.72)}
                    color={active ? colors.primaryDark : hexToRgba(colors.text, 0.5)}
                  />
                </View>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.moreLabel,
                    {
                      color: active ? colors.primaryDark : colors.text,
                      fontSize: scaleFont(Typography.body, 0.78),
                    },
                  ]}
                >
                  {meta.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <View
        style={[
          styles.bar,
          {
            backgroundColor: colors.card,
            borderColor: hexToRgba(colors.primaryDark, 0.08),
            shadowColor: colors.shadow,
            minHeight: verticalScale(76, 0.76),
            borderRadius: scale(30, 0.72),
            paddingHorizontal: scale(18, 0.78),
            paddingVertical: verticalScale(10, 0.76),
          },
        ]}
      >
        <View style={styles.sideGroup}>
          {primaryTabs.slice(0, 2).map(renderPrimaryTab)}
        </View>

        <View style={[styles.centerSpacer, { width: scale(78, 0.76) }]} />

        <View style={styles.sideGroup}>
          {primaryTabs.slice(2).map(renderPrimaryTab)}
        </View>
      </View>

      <View
        pointerEvents="box-none"
        style={[
          styles.centerFloatWrap,
          { bottom: Math.max(insets.bottom, verticalScale(8, 0.7)) + verticalScale(18, 0.72) },
        ]}
      >
        <Pressable
          style={[
            styles.centerButton,
            {
              backgroundColor: isMoreOpen || isOverflowActive ? colors.primaryDark : colors.card,
              borderColor: hexToRgba(colors.primaryDark, 0.12),
              shadowColor: colors.shadow,
              width: scale(64, 0.76),
              height: scale(64, 0.76),
              borderRadius: scale(32, 0.72),
            },
          ]}
          onPress={() => setIsMoreOpen((current) => !current)}
          onLongPress={() => setIsMoreOpen((current) => !current)}
        >
          <MaterialIcons
            name="apps"
            size={scale(26, 0.72)}
            color={isMoreOpen || isOverflowActive ? colors.card : colors.primaryDark}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  morePanel: {
    position: 'absolute',
    zIndex: 20,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    shadowOpacity: 0.14,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  moreItem: {
    flexBasis: 140,
    flexGrow: 1,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  moreIconShell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreLabel: {
    flex: 1,
    fontWeight: '700',
  },
  bar: {
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  sideGroup: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
  },
  iconShell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  centerSpacer: {},
  centerFloatWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 30,
  },
  centerButton: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
});
