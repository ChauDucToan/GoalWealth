import React from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from "react-native";
import { MotionPressable } from '@/components/MotionPressable';
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

  return (
    <MotionPressable
      onPress={onPress}
      disabled={disabled}
      pressableStyle={styles.pressable}
      style={[
        styles.pill,
        {
          backgroundColor: colorBackground,
          minHeight: verticalScale(44, 0.8),
          paddingVertical: verticalScale(10, 0.75),
          paddingHorizontal: responsiveScale(18, 0.78),
          shadowOpacity: 0.16,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 8 },
          elevation: 5,
        },
        style,
      ]}
      pressedStyle={{
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
      }}
      scaleTo={0.974}
      translateYTo={2}
      activeOpacity={0.96}
    >
      <Text
        style={[
          styles.text,
          {
            color: colorText,
            fontSize: scaleFont(Typography.body, 0.8),
          },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </MotionPressable>
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
    textAlign: 'center',
    maxWidth: '100%',
  }
});
