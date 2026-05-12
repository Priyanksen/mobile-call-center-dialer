import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from './AppButton';

interface Props {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Something went wrong.', onRetry }: Props) {
  return (
    <View className="items-center justify-center py-14 px-8">
      <View className="w-16 h-16 rounded-2xl bg-rose-50 items-center justify-center mb-3">
        <Ionicons name="alert-circle-outline" size={30} color="#EF4444" />
      </View>
      <Text className="text-ink-900 dark:text-white text-base font-semibold mb-1">Something went wrong</Text>
      <Text className="text-ink-500 dark:text-ink-400 text-center text-sm mb-4">{message}</Text>
      {onRetry ? <AppButton label="Try again" variant="secondary" onPress={onRetry} icon="refresh-outline" /> : null}
    </View>
  );
}
