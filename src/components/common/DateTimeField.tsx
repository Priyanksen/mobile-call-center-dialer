import React, { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface Props {
  label?: string;
  value: Date | null;
  onChange: (d: Date) => void;
  error?: string | null;
  minimumDate?: Date;
}

function fmt(d: Date | null): string {
  if (!d) return 'Pick date & time';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}  ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function DateTimeField({ label, value, onChange, error, minimumDate }: Props) {
  const [mode, setMode] = useState<'date' | 'time' | null>(null);
  const [tempDate, setTempDate] = useState<Date | null>(null);

  const open = () => setMode('date');

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (event.type === 'dismissed') {
      setMode(null);
      setTempDate(null);
      return;
    }
    if (Platform.OS === 'android') {
      if (mode === 'date' && selected) {
        setTempDate(selected);
        setMode('time');
        return;
      }
      if (mode === 'time' && selected && tempDate) {
        const d = new Date(tempDate);
        d.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
        onChange(d);
        setMode(null);
        setTempDate(null);
        return;
      }
      setMode(null);
    } else if (selected) {
      onChange(selected);
    }
  };

  return (
    <View className="mb-3">
      {label ? <Text className="text-sm text-ink-700 dark:text-ink-200 mb-1.5 font-semibold">{label}</Text> : null}
      <Pressable
        onPress={open}
        className={`bg-white dark:bg-ink-800 border rounded-2xl px-4 py-3.5 flex-row items-center ${
          error ? 'border-danger' : 'border-ink-200 dark:border-ink-700'
        }`}
      >
        <Ionicons name="calendar-outline" size={18} color="#64748B" style={{ marginRight: 8 }} />
        <Text className={`flex-1 text-base ${value ? 'text-ink-900 dark:text-white' : 'text-ink-400 dark:text-ink-500'}`}>{fmt(value)}</Text>
        <Ionicons name="chevron-down" size={18} color="#94A3B8" />
      </Pressable>
      {error ? <Text className="text-xs text-danger mt-1">{error}</Text> : null}
      {mode ? (
        <DateTimePicker
          value={(mode === 'time' && tempDate ? tempDate : value) ?? new Date()}
          mode={mode}
          is24Hour={false}
          minimumDate={minimumDate}
          onChange={handleChange}
        />
      ) : null}
    </View>
  );
}
