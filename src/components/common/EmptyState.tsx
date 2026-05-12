import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  title?: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function EmptyState({
  title = 'Nothing here yet',
  message = 'Check back later.',
  icon = 'sparkles-outline',
}: Props) {
  return (
    <View className="items-center justify-center py-14 px-8">
      <View className="w-16 h-16 rounded-2xl bg-brand-50 items-center justify-center mb-3">
        <Ionicons name={icon} size={28} color="#444CE7" />
      </View>
      <Text className="text-ink-900 dark:text-white text-base font-semibold mb-1">{title}</Text>
      <Text className="text-ink-500 dark:text-ink-400 text-center text-sm">{message}</Text>
    </View>
  );
}
