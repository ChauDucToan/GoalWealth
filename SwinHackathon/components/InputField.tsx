import { useTheme } from '@/hooks/use-theme-colors';
import { useResponsive } from '@/hooks/use-responsive';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Typography } from '@/constants/theme';
import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';

interface InputFieldProps extends Omit<TextInputProps, 'style'> {
  /** Label shown above the input */
  label: string;
  /** Optional icon name from MaterialIcons (e.g. "email", "lock") */
  iconName?: React.ComponentProps<typeof MaterialIcons>['name'];
  /** Optional custom icon node (takes precedence over `iconName`) */
  icon?: React.ReactNode;
  /** If true, adds a toggle eye icon to show/hide password */
  isPassword?: boolean;
  containerStyle?: ViewStyle | ViewStyle[];
  inputStyle?: TextStyle | TextStyle[];
  labelStyle?: TextStyle | TextStyle[];
  iconContainerStyle?: ViewStyle | ViewStyle[];
  status?: 'default' | 'error' | 'success';
  helperText?: string;
  helperTextStyle?: TextStyle | TextStyle[];
}

function hexToRgba(hex: string, alpha: number) {
  const cleanHex = hex.replace('#', '');
  const normalized = cleanHex.length === 3
    ? cleanHex.split('').map((value) => `${value}${value}`).join('')
    : cleanHex;

  const bigint = parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const InputField = React.forwardRef<TextInput, InputFieldProps>(
  (
    {
      label,
      iconName,
      icon,
      isPassword = false,
      containerStyle,
      inputStyle,
      labelStyle,
      iconContainerStyle,
      status = 'default',
      helperText,
      helperTextStyle,
      placeholderTextColor,
      secureTextEntry,
      ...rest
    },
    ref
  ) => {
    const { colors } = useTheme();
    const { scale, verticalScale, scaleFont } = useResponsive();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const effectiveSecureTextEntry = isPassword ? !isPasswordVisible : secureTextEntry;
    const borderColor = status === 'error'
      ? colors.error
      : status === 'success'
        ? colors.primaryDark
        : colors.border;
    const helperColor = status === 'error'
      ? colors.error
      : status === 'success'
        ? colors.primaryDark
        : hexToRgba(colors.text, 0.58);
    const backgroundColor = status === 'error'
      ? hexToRgba(colors.error, 0.04)
      : colors.card;

    return (
      <View style={[styles.container, containerStyle]}>
        <Text
          style={[
            styles.label,
            {
              color: colors.text,
              marginBottom: verticalScale(8, 0.6),
              fontSize: scaleFont(Typography.body, 0.8),
            },
            labelStyle,
          ]}
        >
          {label}
        </Text>

        <View
          style={[
            styles.inputRow,
            {
              borderColor,
              backgroundColor,
              minHeight: verticalScale(48, 0.75),
              paddingHorizontal: scale(14, 0.78),
              paddingVertical: verticalScale(12, 0.75),
            },
            iconContainerStyle,
          ]}
        >
          {icon ??
            (iconName ? (
              <MaterialIcons
                name={iconName}
                size={scale(20, 0.7)}
                color={hexToRgba(colors.text, 0.66)}
                style={[styles.icon, { marginRight: scale(8, 0.7) }]}
              />
            ) : null)}

          <TextInput
            ref={ref}
            style={[
              styles.input,
              { color: colors.text, fontSize: scaleFont(Typography.body, 0.82) },
              inputStyle,
            ]}
            placeholderTextColor={placeholderTextColor ?? hexToRgba(colors.text, 0.4)}
            secureTextEntry={effectiveSecureTextEntry}
            {...rest}
          />

          {isPassword && (
            <Pressable
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              style={styles.eyeIcon}
            >
              <MaterialIcons
                name={isPasswordVisible ? 'visibility' : 'visibility-off'}
                size={scale(20, 0.7)}
                color={hexToRgba(colors.text, 0.48)}
              />
            </Pressable>
          )}
        </View>

        {helperText ? (
          <Text
            style={[
              styles.helperText,
              {
                color: helperColor,
                marginTop: verticalScale(8, 0.6),
                fontSize: scaleFont(Typography.body, 0.75),
              },
              helperTextStyle,
            ]}
          >
            {helperText}
          </Text>
        ) : null}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 999,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    padding: 0,
  },
  eyeIcon: {
    marginLeft: 8,
    padding: 2,
  },
  helperText: {
    fontWeight: '600',
  },
});

InputField.displayName = 'InputField';
