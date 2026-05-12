import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  tone?: 'brand' | 'success' | 'warn' | 'sky' | 'violet' | 'rose';
}

const toneClass: Record<NonNullable<Props['tone']>, { bg: string; iconColor: string }> = {
  brand: { bg: 'bg-brand-50', iconColor: '#444CE7' },
  success: { bg: 'bg-emerald-50', iconColor: '#10B981' },
  warn: { bg: 'bg-amber-50', iconColor: '#F59E0B' },
  sky: { bg: 'bg-sky-50', iconColor: '#0EA5E9' },
  violet: { bg: 'bg-violet-50', iconColor: '#8B5CF6' },
  rose: { bg: 'bg-rose-50', iconColor: '#F43F5E' },
};

export function QuickActionCard({ icon, label, onPress, tone = 'brand' }: Props) {
  const c = toneClass[tone];
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 mr-2 mb-2 bg-white dark:bg-ink-800 rounded-2xl p-4 border border-ink-200 dark:border-ink-700 active:opacity-80 items-center"
      style={{ elevation: 1 }}
    >
      <View className={`w-12 h-12 rounded-2xl items-center justify-center mb-2 ${c.bg}`}>
        <Ionicons name={icon} size={22} color={c.iconColor} />
      </View>
      <Text className="text-ink-800 dark:text-white font-semibold text-sm text-center">{label}</Text>
    </Pressable>
  );
}
