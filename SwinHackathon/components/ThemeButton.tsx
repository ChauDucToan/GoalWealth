import React, { useRef } from "react";
import {
  Animated,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from "react-native";
import { Typography } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';

interface ButtonProps {
    title: string;
    onPress: () => void;
    colorBackground: string;
    colorText: string;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    disabled?: boolean;
}

export const ThemeButton = ({ title, onPress, colorBackground = '#fff', colorText='#000', style, textStyle, disabled = false }: ButtonProps) => {
  const { scale: responsiveScale, verticalScale, scaleFont } = useResponsive();
  const scale = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const animateTo = (scaleValue: number, translateYValue: number) => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: scaleValue,
        useNativeDriver: true,
        speed: 24,
        bounciness: 4,
      }),
      Animated.spring(translateY, {
        toValue: translateYValue,
        useNativeDriver: true,
        speed: 24,
        bounciness: 4,
      }),
    ]).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => animateTo(0.97, 2)}
      onPressOut={() => animateTo(1, 0)}
      disabled={disabled}
      style={styles.pressable}
      android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
    >
      {({ pressed }) => (
        <Animated.View
          style={[
            styles.pill,
            {
              backgroundColor: colorBackground,
              opacity: disabled ? 0.55 : pressed ? 0.96 : 1,
              transform: [{ scale }, { translateY }],
              minHeight: verticalScale(44, 0.8),
              paddingVertical: verticalScale(10, 0.75),
              paddingHorizontal: responsiveScale(18, 0.78),
              shadowOpacity: pressed ? 0.08 : 0.16,
              shadowRadius: pressed ? 10 : 14,
              shadowOffset: { width: 0, height: pressed ? 4 : 8 },
              elevation: pressed ? 3 : 5,
            },
            style,
          ]}
        >
          <Text
            style={[
              styles.text,
              { color: colorText, fontSize: scaleFont(Typography.body, 0.8) },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </Animated.View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    alignSelf: 'stretch',
  },
  pill: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(15,23,42,0.18)',
  },
  text: {
    fontWeight: '700',
  }
});
