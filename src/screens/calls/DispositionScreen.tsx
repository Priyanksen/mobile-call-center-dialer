import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DispositionForm } from '@/components/calls/DispositionForm';
import { GradientHeader } from '@/components/common/GradientHeader';
import { BottomSheet } from '@/components/common/BottomSheet';
import { AppButton } from '@/components/common/AppButton';
import { callsApi } from '@/api/callsApi';
import { leadsApi } from '@/api/leadsApi';
import { RootStackParamList } from '@/navigation/types';

type R = RouteProp<RootStackParamList, 'Disposition'>;

export function DispositionScreen() {
  const route = useRoute<R>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { callId, lead } = route.params;
  const [submitting, setSubmitting] = useState(false);

  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  const submit = async (req: Parameters<typeof callsApi.disposition>[0]) => {
    setSubmitting(true);
    try {
      await callsApi.disposition(req);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Main' as never }],
        }),
      );
    } catch (e) {
      Alert.alert('Submit failed', (e as Error).message || 'Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const saveNote = async () => {
    if (!noteText.trim()) return;
    setSavingNote(true);
    try {
      const merged = lead.notes ? `${lead.notes}\n\n${noteText.trim()}` : noteText.trim();
      await leadsApi.update(lead.id, { notes: merged });
      setSavedCount((n) => n + 1);
      setNoteOpen(false);
      setNoteText('');
    } catch {
      Alert.alert('Save failed', 'Could not save the note.');
    } finally {
      setSavingNote(false);
    }
  };

  const initial = lead.name.trim().charAt(0).toUpperCase();

  return (
    <View className="flex-1 bg-bg dark:bg-ink-900">
      <GradientHeader title="Call Outcome" subtitle={lead.name} hideBack />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          className="bg-white dark:bg-ink-800 rounded-3xl p-4 mb-3 flex-row items-center"
          style={{ elevation: 2 }}
        >
          <View className="w-14 h-14 rounded-2xl bg-brand-50 items-center justify-center mr-3">
            <Text className="text-brand-700 text-xl font-bold">{initial}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-ink-500 dark:text-ink-400 text-xs font-semibold uppercase">Customer</Text>
            <Text className="text-ink-900 dark:text-white text-base font-bold mt-0.5">{lead.name}</Text>
            <View className="flex-row items-center mt-0.5">
              <Ionicons name="call-outline" size={12} color="#64748B" />
              <Text className="text-ink-500 dark:text-ink-400 text-xs ml-1">{lead.phone}</Text>
            </View>
          </View>
        </View>

        {/* Add note button */}
        <Pressable
          onPress={() => setNoteOpen(true)}
          className="bg-white dark:bg-ink-800 rounded-2xl border border-ink-200 dark:border-ink-700 p-3.5 mb-3 flex-row items-center active:opacity-80"
          style={{ elevation: 1 }}
        >
          <View className="w-10 h-10 rounded-xl bg-amber-50 items-center justify-center mr-3">
            <Ionicons name="create-outline" size={18} color="#F59E0B" />
          </View>
          <View className="flex-1">
            <Text className="text-ink-900 dark:text-white text-sm font-bold">Add note to lead</Text>
            <Text className="text-ink-500 dark:text-ink-400 text-xs mt-0.5">
              {savedCount === 0
                ? 'Quick note about this customer'
                : `${savedCount} note${savedCount === 1 ? '' : 's'} saved`}
            </Text>
          </View>
          {savedCount > 0 ? (
            <View className="px-2 py-0.5 rounded-full bg-emerald-50 flex-row items-center mr-1">
              <Ionicons name="checkmark" size={12} color="#10B981" />
              <Text className="text-emerald-700 text-[10px] font-bold ml-0.5">SAVED</Text>
            </View>
          ) : null}
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </Pressable>

        <View
          className="bg-white dark:bg-ink-800 rounded-2xl p-4 border border-ink-200 dark:border-ink-700"
          style={{ elevation: 1 }}
        >
          <Text className="text-ink-900 dark:text-white text-base font-bold mb-3">Call outcome</Text>
          <DispositionForm callId={callId} leadId={lead.id} submitting={submitting} onSubmit={submit} />
        </View>
      </ScrollView>

      <BottomSheet visible={noteOpen} onClose={() => setNoteOpen(false)} title="Add note">
        <TextInput
          value={noteText}
          onChangeText={setNoteText}
          multiline
          autoFocus
          placeholder="Anything important about this customer — preferences, objections, follow-up plan…"
          placeholderTextColor="#94A3B8"
          className="bg-ink-50 dark:bg-ink-700 rounded-xl px-3 py-3 text-ink-900 dark:text-white text-base mb-3"
          style={{ minHeight: 120, textAlignVertical: 'top' }}
        />
        <AppButton
          label="Save note"
          onPress={saveNote}
          loading={savingNote}
          fullWidth
          icon="save-outline"
          disabled={!noteText.trim()}
        />
      </BottomSheet>
    </View>
  );
}
