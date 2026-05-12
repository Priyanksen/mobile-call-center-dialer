import React from 'react';
import { Pressable, Text } from 'react-native';

interface Props {
  label: string;
  active?: boolean;
  onPress: () => void;
}

export function FilterChip({ label, active, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-3.5 py-2 rounded-full border mr-2 ${
        active ? 'bg-brand-600 border-brand-600' : 'bg-white dark:bg-ink-800 border-ink-200 dark:border-ink-700'
      }`}
    >
      <Text className={active ? 'text-white text-xs font-semibold' : 'text-ink-700 dark:text-ink-200 text-xs font-semibold'}>
        {label}
      </Text>
    </Pressable>
  );
}
