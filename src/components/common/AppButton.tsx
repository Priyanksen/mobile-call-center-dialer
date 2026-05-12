import React from 'react';
import { ActivityIndicator, Pressable, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}

const variantClass: Record<Variant, string> = {
  primary: 'bg-brand-600 active:bg-brand-700',
  secondary: 'bg-ink-900 active:bg-ink-800',
  danger: 'bg-danger active:opacity-90',
  success: 'bg-success active:opacity-90',
  ghost: 'bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 active:bg-ink-50 dark:bg-ink-700',
};

const labelClass: Record<Variant, string> = {
  primary: 'text-white',
  secondary: 'text-white',
  danger: 'text-white',
  success: 'text-white',
  ghost: 'text-ink-800 dark:text-white',
};

const sizeClass: Record<Size, string> = {
  sm: 'px-3 py-2',
  md: 'px-4 py-3',
  lg: 'px-5 py-4',
};

const iconColor: Record<Variant, string> = {
  primary: '#fff',
  secondary: '#fff',
  danger: '#fff',
  success: '#fff',
  ghost: '#1E293B',
};

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  style,
  fullWidth,
  icon,
}: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={style}
      className={`rounded-2xl items-center justify-center flex-row ${variantClass[variant]} ${sizeClass[size]} ${
        fullWidth ? 'w-full' : ''
      } ${isDisabled ? 'opacity-60' : ''}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'ghost' ? '#0B1220' : '#fff'} />
      ) : (
        <View className="flex-row items-center">
          {icon ? (
            <Ionicons name={icon} size={size === 'lg' ? 20 : 18} color={iconColor[variant]} style={{ marginRight: 8 }} />
          ) : null}
          <Text className={`font-semibold text-base ${labelClass[variant]}`}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}
