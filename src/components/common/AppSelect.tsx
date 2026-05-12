import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

export interface SelectOption<T extends string | number> {
  label: string;
  value: T;
}

interface Props<T extends string | number> {
  label?: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (v: T) => void;
}

export function AppSelect<T extends string | number>({ label, value, options, onChange }: Props<T>) {
  return (
    <View className="mb-3">
      {label ? <Text className="text-sm text-ink-700 dark:text-ink-200 mb-1 font-medium">{label}</Text> : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2">
          {options.map((o) => {
            const active = o.value === value;
            return (
              <Pressable
                key={String(o.value)}
                onPress={() => onChange(o.value)}
                className={`px-4 py-2 rounded-full border ${
                  active ? 'bg-brand-600 border-brand-600' : 'bg-white dark:bg-ink-800 border-ink-300'
                }`}
              >
                <Text className={active ? 'text-white font-semibold' : 'text-ink-800 dark:text-white'}>{o.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
