import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from './BottomSheet';

export interface DropdownOption<T extends string | number> {
  label: string;
  value: T;
}

interface Props<T extends string | number> {
  label?: string;
  value: T;
  options: DropdownOption<T>[];
  onChange: (v: T) => void;
  placeholder?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function Dropdown<T extends string | number>({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select…',
  icon,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);

  return (
    <View className="flex-1">
      {label ? (
        <Text className="text-[10px] text-ink-500 dark:text-ink-400 font-bold uppercase mb-1 tracking-wide">
          {label}
        </Text>
      ) : null}
      <Pressable
        onPress={() => setOpen(true)}
        className="bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-xl px-3 py-2.5 flex-row items-center active:opacity-80"
      >
        {icon ? <Ionicons name={icon} size={16} color="#64748B" style={{ marginRight: 6 }} /> : null}
        <Text
          className={`flex-1 text-sm font-semibold ${current ? 'text-ink-900 dark:text-white' : 'text-ink-400 dark:text-ink-500'}`}
          numberOfLines={1}
        >
          {current?.label ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#94A3B8" />
      </Pressable>

      <BottomSheet visible={open} onClose={() => setOpen(false)} title={label ?? 'Select'}>
        <View>
          {options.map((o) => {
            const active = o.value === value;
            return (
              <Pressable
                key={String(o.value)}
                onPress={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`flex-row items-center px-3 py-3 rounded-xl mb-1 ${
                  active ? 'bg-brand-50 dark:bg-ink-700' : 'active:bg-ink-50 dark:active:bg-ink-700'
                }`}
              >
                <Text
                  className={`flex-1 font-semibold ${
                    active ? 'text-brand-700 dark:text-brand-200' : 'text-ink-900 dark:text-white'
                  }`}
                >
                  {o.label}
                </Text>
                {active ? <Ionicons name="checkmark" size={20} color="#444CE7" /> : null}
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    </View>
  );
}
