import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <View className="flex-1 items-center justify-center py-12 bg-bg dark:bg-ink-900">
      <View className="w-12 h-12 rounded-2xl bg-white dark:bg-ink-800 items-center justify-center" style={{ elevation: 2 }}>
        <ActivityIndicator color="#444CE7" />
      </View>
      <Text className="text-ink-500 dark:text-ink-400 mt-3 text-sm">{label}</Text>
    </View>
  );
}
