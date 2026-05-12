import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  variant?: 'default' | 'danger' | 'success' | 'muted';
  disabled?: boolean;
  large?: boolean;
}

const variantClass = {
  default: 'bg-white/10 border border-white/20',
  danger: 'bg-rose-500',
  success: 'bg-emerald-500',
  muted: 'bg-white/5 border border-white/10',
};

const iconColor = {
  default: '#fff',
  danger: '#fff',
  success: '#fff',
  muted: '#94A3B8',
};

export function CallControlButton({
  label,
  icon,
  onPress,
  variant = 'default',
  disabled,
  large,
}: Props) {
  const size = large ? 'w-20 h-20' : 'w-16 h-16';
  const iconSize = large ? 32 : 24;
  return (
    <View className="items-center">
      <Pressable
        onPress={onPress}
        disabled={disabled}
        className={`${size} rounded-full items-center justify-center ${variantClass[variant]} ${
          disabled ? 'opacity-40' : 'active:opacity-80'
        }`}
        style={
          variant === 'danger' || variant === 'success'
            ? {
                elevation: 6,
                shadowColor: variant === 'danger' ? '#F43F5E' : '#10B981',
                shadowOpacity: 0.4,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
              }
            : undefined
        }
      >
        <Ionicons name={icon} size={iconSize} color={iconColor[variant]} />
      </Pressable>
      <Text className="text-xs text-white/70 mt-2 font-medium">{label}</Text>
    </View>
  );
}
