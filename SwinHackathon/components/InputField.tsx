import { useTheme } from '@/hooks/use-theme-colors';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
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
      placeholderTextColor,
      secureTextEntry,
      ...rest
    },
    ref
  ) => {
    const { colors } = useTheme();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const effectiveSecureTextEntry = isPassword ? !isPasswordVisible : secureTextEntry;

    return (
      <View style={[styles.container, containerStyle]}>
        <Text style={[styles.label, { color: colors.text }, labelStyle]}>{label}</Text>

        <View style={[styles.inputRow, iconContainerStyle]}>
          {icon ??
            (iconName ? (
              <MaterialIcons
                name={iconName}
                size={20}
                color={colors.text}
                style={styles.icon}
              />
            ) : null)}

          <TextInput
            ref={ref}
            style={[
              styles.input,
              { color: colors.text, borderColor: colors.border },
              inputStyle,
            ]}
            placeholderTextColor={placeholderTextColor ?? colors.text}
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
                size={20}
                color={colors.text}
              />
            </Pressable>
          )}
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: '85%',
    
  },
  label: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  eyeIcon: {
    marginLeft: 10,
    padding: 4,
  },
});

InputField.displayName = 'InputField';
