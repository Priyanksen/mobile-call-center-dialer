import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppButton } from '@/components/common/AppButton';
import { DateTimeField } from '@/components/common/DateTimeField';
import { GradientHeader } from '@/components/common/GradientHeader';
import { callbacksApi } from '@/api/callbacksApi';
import { RootStackParamList } from '@/navigation/types';

type R = RouteProp<RootStackParamList, 'ScheduleCallback'>;

const PRESETS = [
  { label: '+1 hour', mins: 60 },
  { label: '+3 hours', mins: 180 },
  { label: 'Tomorrow 10am', mins: -1 },
  { label: 'Next Mon 11am', mins: -2 },
];

function presetDate(p: (typeof PRESETS)[number]): Date {
  const now = new Date();
  if (p.mins > 0) return new Date(now.getTime() + p.mins * 60000);
  if (p.mins === -1) {
    const t = new Date(now);
    t.setDate(t.getDate() + 1);
    t.setHours(10, 0, 0, 0);
    return t;
  }
  const t = new Date(now);
  const day = t.getDay();
  const delta = day === 1 ? 7 : (1 - day + 7) % 7 || 7;
  t.setDate(t.getDate() + delta);
  t.setHours(11, 0, 0, 0);
  return t;
}

export function ScheduleCallbackScreen() {
  const route = useRoute<R>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { lead } = route.params;

  const [when, setWhen] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (!when) {
      setError('Please pick a date and time.');
      return;
    }
    if (when.getTime() <= Date.now()) {
      setError('Pick a time in the future.');
      return;
    }
    setSubmitting(true);
    try {
      await callbacksApi.create({
        lead_id: lead.id,
        scheduled_at: when.toISOString(),
        notes: notes.trim() || undefined,
      });
      Alert.alert('Scheduled', 'Follow-up was saved.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Failed', (e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const initial = lead.name.trim().charAt(0).toUpperCase();

  return (
    <View className="flex-1 bg-bg dark:bg-ink-900">
      <GradientHeader title="Schedule Follow-up" subtitle={lead.name} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        <View
          className="bg-white dark:bg-ink-800 rounded-3xl p-4 mb-3 flex-row items-center"
          style={{ elevation: 2 }}
        >
          <View className="w-12 h-12 rounded-2xl bg-brand-50 items-center justify-center mr-3">
            <Text className="text-brand-700 text-lg font-bold">{initial}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-ink-500 dark:text-ink-400 text-xs font-semibold uppercase">Lead</Text>
            <Text className="text-ink-900 dark:text-white text-base font-bold mt-0.5">{lead.name}</Text>
            <Text className="text-ink-500 dark:text-ink-400 text-xs mt-0.5">{lead.phone}</Text>
          </View>
        </View>

        <View className="bg-white dark:bg-ink-800 rounded-2xl p-4 border border-ink-200 dark:border-ink-700 mb-3" style={{ elevation: 1 }}>
          <Text className="text-ink-900 dark:text-white text-base font-bold mb-3">When</Text>
          <View className="flex-row flex-wrap mb-3 -mr-2">
            {PRESETS.map((p) => (
              <View key={p.label} className="mr-2 mb-2">
                <AppButton
                  label={p.label}
                  variant="ghost"
                  size="sm"
                  onPress={() => setWhen(presetDate(p))}
                />
              </View>
            ))}
          </View>
          <DateTimeField
            label="Date & time"
            value={when}
            onChange={setWhen}
            error={error}
            minimumDate={new Date()}
          />
        </View>

        <View className="bg-white dark:bg-ink-800 rounded-2xl p-4 border border-ink-200 dark:border-ink-700 mb-4" style={{ elevation: 1 }}>
          <View className="flex-row items-center mb-2">
            <Ionicons name="document-text-outline" size={16} color="#64748B" />
            <Text className="text-ink-700 dark:text-ink-200 ml-2 font-semibold">Notes</Text>
          </View>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            multiline
            placeholder="Optional notes about the callback…"
            placeholderTextColor="#94A3B8"
            className="bg-ink-50 dark:bg-ink-700 rounded-xl px-3 py-3 text-ink-900 dark:text-white text-base"
            style={{ minHeight: 100, textAlignVertical: 'top' }}
          />
        </View>

        <AppButton
          label="Save Follow-up"
          onPress={submit}
          loading={submitting}
          fullWidth
          size="lg"
          icon="save-outline"
        />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
