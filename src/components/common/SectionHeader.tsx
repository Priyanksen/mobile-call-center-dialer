import React, { ReactNode } from 'react';
import { Text, View } from 'react-native';

interface Props {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  className?: string;
}

export function SectionHeader({ title, subtitle, right, className }: Props) {
  return (
    <View className={`flex-row items-end justify-between mb-2 mt-1 ${className ?? ''}`}>
      <View className="flex-1 pr-3">
        <Text className="text-ink-900 dark:text-white text-base font-bold">{title}</Text>
        {subtitle ? <Text className="text-ink-500 dark:text-ink-400 text-xs mt-0.5">{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}
