import React from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props extends TextInputProps {
  label?: string;
  error?: string | null;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function AppInput({ label, error, icon, ...rest }: Props) {
  return (
    <View className="mb-3">
      {label ? <Text className="text-sm text-ink-700 dark:text-ink-200 mb-1.5 font-semibold">{label}</Text> : null}
      <View
        className={`bg-white dark:bg-ink-800 border rounded-2xl px-4 flex-row items-center ${
          error ? 'border-danger' : 'border-ink-200 dark:border-ink-700'
        }`}
      >
        {icon ? <Ionicons name={icon} size={18} color="#94A3B8" style={{ marginRight: 8 }} /> : null}
        <TextInput
          {...rest}
          placeholderTextColor="#94A3B8"
          className="flex-1 py-3.5 text-ink-900 dark:text-white text-base"
        />
      </View>
      {error ? <Text className="text-xs text-danger mt-1">{error}</Text> : null}
    </View>
  );
}
