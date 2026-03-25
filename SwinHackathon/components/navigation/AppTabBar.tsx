import { hexToRgba } from '@/components/auth/AuthKit';
import { Typography } from '@/constants/theme';
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
  'news-resources': { label: 'News', icon: 'newspaper' },
  'search-notifications': { label: 'Search', icon: 'search' },
};

export function AppTabBar({ state, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
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
            },
          ]}
        >
          <MaterialIcons
            name={meta.icon}
            size={24}
            color={active ? colors.primaryDark : hexToRgba(colors.text, 0.4)}
          />
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {isMoreOpen ? (
        <View
          style={[
            styles.morePanel,
            {
              backgroundColor: colors.card,
              borderColor: hexToRgba(colors.primaryDark, 0.08),
              shadowColor: colors.shadow,
              bottom: Math.max(insets.bottom, 8) + 92,
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
                  },
                ]}
              >
                <View
                  style={[
                    styles.moreIconShell,
                    { backgroundColor: active ? colors.primaryLight : colors.backgroundSoft },
                  ]}
                >
                  <MaterialIcons
                    name={meta.icon}
                    size={20}
                    color={active ? colors.primaryDark : hexToRgba(colors.text, 0.5)}
                  />
                </View>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.moreLabel,
                    { color: active ? colors.primaryDark : colors.text },
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
          },
        ]}
      >
        <View style={styles.sideGroup}>
          {primaryTabs.slice(0, 2).map(renderPrimaryTab)}
        </View>

        <View style={styles.centerSpacer} />

        <View style={styles.sideGroup}>
          {primaryTabs.slice(2).map(renderPrimaryTab)}
        </View>
      </View>

      <View
        pointerEvents="box-none"
        style={[styles.centerFloatWrap, { bottom: Math.max(insets.bottom, 8) + 18 }]}
      >
        <Pressable
          style={[
            styles.centerButton,
            {
              backgroundColor: isMoreOpen || isOverflowActive ? colors.primaryDark : colors.card,
              borderColor: hexToRgba(colors.primaryDark, 0.12),
              shadowColor: colors.shadow,
            },
          ]}
          onPress={() => setIsMoreOpen((current) => !current)}
          onLongPress={() => setIsMoreOpen((current) => !current)}
        >
          <MaterialIcons
            name="apps"
            size={26}
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
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  morePanel: {
    position: 'absolute',
    left: 18,
    right: 18,
    zIndex: 20,
    borderRadius: 24,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    shadowOpacity: 0.14,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  moreItem: {
    width: '47%',
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  moreIconShell: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreLabel: {
    flex: 1,
    fontSize: Typography.body,
    fontWeight: '700',
  },
  bar: {
    minHeight: 76,
    borderRadius: 30,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 10,
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
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  centerSpacer: {
    width: 78,
  },
  centerFloatWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 30,
  },
  centerButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
});
