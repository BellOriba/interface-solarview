import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  ViewStyle, 
  TextStyle,
  TouchableOpacity,
  Platform 
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  error,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
}: InputProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const styles = StyleSheet.create({
    container: {
      marginBottom: Spacing.md,
    },
    label: {
      ...Typography.body2,
      color: colors.text,
      marginBottom: Spacing.xs,
      fontWeight: '600',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: error ? colors.error : colors.border,
      borderRadius: BorderRadius.md,
      backgroundColor: colors.surface,
      paddingHorizontal: Spacing.md,
    },
    input: {
      ...Typography.body1,
      flex: 1,
      paddingVertical: Spacing.md,
      color: colors.text,
      minHeight: multiline ? numberOfLines * 20 : undefined,
    },
    eyeButton: {
      padding: Spacing.xs,
    },
    error: {
      ...Typography.caption,
      color: colors.error,
      marginTop: Spacing.xs,
    },
  });

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputContainer,
        isFocused && { borderColor: colors.primary, borderWidth: 2 }
      ]}>
        <TextInput
          style={[
            styles.input,
            inputStyle,
            Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff size={20} color={colors.textSecondary} />
            ) : (
              <Eye size={20} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}