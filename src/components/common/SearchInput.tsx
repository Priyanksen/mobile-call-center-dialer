import React from 'react';
import { TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChangeText, placeholder = 'Search…' }: Props) {
  return (
    <View className="bg-white dark:bg-ink-800 rounded-2xl border border-ink-200 dark:border-ink-700 px-4 py-1 mb-3 flex-row items-center">
      <Ionicons name="search" size={18} color="#94A3B8" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        className="flex-1 ml-2 py-2.5 text-ink-900 dark:text-white text-base"
      />
    </View>
  );
}
