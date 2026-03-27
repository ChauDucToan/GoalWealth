import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from 'react-native';

type MotionPressableProps = Omit<PressableProps, 'style' | 'children'> & {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  pressableStyle?: StyleProp<ViewStyle>;
  pressedStyle?: StyleProp<ViewStyle>;
  scaleTo?: number;
  translateYTo?: number;
  activeOpacity?: number;
  debounceMs?: number;
  disableDebounce?: boolean;
};

export function MotionPressable({
  children,
  style,
  pressableStyle,
  pressedStyle,
  scaleTo = 0.975,
  translateYTo = 2,
  activeOpacity = 0.96,
  debounceMs = 650,
  disableDebounce = false,
  onPressIn,
  onPressOut,
  disabled,
  onPress,
  ...rest
}: MotionPressableProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const cooldownUntilRef = useRef(0);

  const animateTo = (nextScale: number, nextTranslateY: number) => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: nextScale,
        useNativeDriver: true,
        speed: 28,
        bounciness: 5,
      }),
      Animated.spring(translateY, {
        toValue: nextTranslateY,
        useNativeDriver: true,
        speed: 28,
        bounciness: 5,
      }),
    ]).start();
  };

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      onPress={(event) => {
        if (!onPress) {
          return;
        }

        if (disableDebounce) {
          onPress(event);
          return;
        }

        const now = Date.now();
        if (now < cooldownUntilRef.current) {
          return;
        }

        cooldownUntilRef.current = now + debounceMs;

        try {
          onPress(event);
        } catch (error) {
          cooldownUntilRef.current = 0;
          throw error;
        }
      }}
      onPressIn={(event) => {
        animateTo(scaleTo, translateYTo);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        animateTo(1, 0);
        onPressOut?.(event);
      }}
      style={pressableStyle}
    >
      {({ pressed }) => (
        <Animated.View
          style={[
            style,
            pressed ? pressedStyle : undefined,
            {
              opacity: disabled ? 0.55 : pressed ? activeOpacity : 1,
              transform: [{ scale }, { translateY }],
            },
          ]}
        >
          {children}
        </Animated.View>
      )}
    </Pressable>
  );
}
