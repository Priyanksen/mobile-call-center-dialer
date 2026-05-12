import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  label: string;
  value: number | string;
  icon: keyof typeof Ionicons.glyphMap;
  tone?: 'brand' | 'success' | 'warn' | 'danger' | 'sky' | 'violet';
}

const toneClass: Record<NonNullable<Props['tone']>, { bg: string; iconColor: string }> = {
  brand: { bg: 'bg-brand-50', iconColor: '#444CE7' },
  success: { bg: 'bg-emerald-50', iconColor: '#10B981' },
  warn: { bg: 'bg-amber-50', iconColor: '#F59E0B' },
  danger: { bg: 'bg-rose-50', iconColor: '#EF4444' },
  sky: { bg: 'bg-sky-50', iconColor: '#0EA5E9' },
  violet: { bg: 'bg-violet-50', iconColor: '#8B5CF6' },
};

export function StatCard({ label, value, icon, tone = 'brand' }: Props) {
  const c = toneClass[tone];
  return (
    <View
      className="flex-1 mr-2 mb-2 bg-white dark:bg-ink-800 rounded-2xl p-3.5 border border-ink-200 dark:border-ink-700 flex-row items-center"
      style={{ elevation: 1 }}
    >
      <View className={`w-11 h-11 rounded-2xl items-center justify-center mr-3 ${c.bg}`}>
        <Ionicons name={icon} size={20} color={c.iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-xl font-bold text-ink-900 dark:text-white">{value}</Text>
        <Text className="text-ink-500 dark:text-ink-400 text-xs font-semibold" numberOfLines={1}>{label}</Text>
      </View>
    </View>
  );
}
