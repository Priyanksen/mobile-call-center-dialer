import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/common/AppButton';
import { DateTimeField } from '@/components/common/DateTimeField';
import { DispositionRequest, DispositionStatus } from '@/types/call';

interface Props {
  callId: string;
  leadId: number;
  submitting?: boolean;
  onSubmit: (req: DispositionRequest) => void;
}

interface OptDef {
  value: DispositionStatus;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  bg: string;
  ring: string;
  color: string;
}

const OPTIONS: OptDef[] = [
  { value: 'interested', label: 'Interested', icon: 'thumbs-up-outline', bg: 'bg-emerald-50', ring: 'border-emerald-500', color: '#10B981' },
  { value: 'not_interested', label: 'Not interested', icon: 'thumbs-down-outline', bg: 'bg-rose-50', ring: 'border-rose-500', color: '#EF4444' },
  { value: 'callback', label: 'Follow-up', icon: 'alarm-outline', bg: 'bg-amber-50', ring: 'border-amber-500', color: '#F59E0B' },
  { value: 'no_answer', label: 'No answer', icon: 'call-outline', bg: 'bg-ink-100 dark:bg-ink-700', ring: 'border-ink-500', color: '#64748B' },
  { value: 'busy', label: 'Busy', icon: 'time-outline', bg: 'bg-sky-50', ring: 'border-sky-500', color: '#0EA5E9' },
  { value: 'wrong_number', label: 'Wrong number', icon: 'alert-circle-outline', bg: 'bg-rose-50', ring: 'border-rose-500', color: '#EF4444' },
  { value: 'converted', label: 'Converted', icon: 'trophy-outline', bg: 'bg-violet-50', ring: 'border-violet-500', color: '#8B5CF6' },
  { value: 'closed', label: 'Closed', icon: 'lock-closed-outline', bg: 'bg-ink-100 dark:bg-ink-700', ring: 'border-ink-500', color: '#64748B' },
];

export function DispositionForm({ callId, leadId, submitting, onSubmit }: Props) {
  const [status, setStatus] = useState<DispositionStatus>('interested');
  const [notes, setNotes] = useState('');
  const [callbackTime, setCallbackTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    if (status === 'callback' && !callbackTime) {
      setError('Follow-up date/time is required.');
      return;
    }
    onSubmit({
      call_id: callId,
      lead_id: leadId,
      status,
      notes: notes.trim(),
      callback_time: callbackTime ? callbackTime.toISOString() : null,
    });
  };

  return (
    <View>
      <View className="flex-row flex-wrap -mr-2">
        {OPTIONS.map((o) => {
          const active = status === o.value;
          return (
            <Pressable
              key={o.value}
              onPress={() => setStatus(o.value)}
              className={`mr-2 mb-2 px-3 py-3 rounded-2xl border-2 items-center justify-center ${
                active ? `${o.bg} ${o.ring}` : 'bg-white dark:bg-ink-800 border-ink-200 dark:border-ink-700'
              }`}
              style={{ width: '47%' }}
            >
              <View className={`w-10 h-10 rounded-xl items-center justify-center mb-1.5 ${active ? 'bg-white dark:bg-ink-800' : o.bg}`}>
                <Ionicons name={o.icon} size={20} color={o.color} />
              </View>
              <Text className={`text-sm font-semibold ${active ? 'text-ink-900 dark:text-white' : 'text-ink-700 dark:text-ink-200'}`}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {status === 'callback' ? (
        <View className="mt-3">
          <DateTimeField
            label="Follow-up date/time"
            value={callbackTime}
            onChange={setCallbackTime}
            error={error}
            minimumDate={new Date()}
          />
        </View>
      ) : null}

      <View className="mt-2">
        <View className="flex-row items-center mb-2">
          <Ionicons name="document-text-outline" size={16} color="#64748B" />
          <Text className="text-ink-700 dark:text-ink-200 ml-2 font-semibold">Notes</Text>
        </View>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          multiline
          placeholder="Add a note about this call…"
          placeholderTextColor="#94A3B8"
          className="bg-ink-50 dark:bg-ink-700 rounded-xl px-3 py-3 text-ink-900 dark:text-white text-base mb-4"
          style={{ minHeight: 100, textAlignVertical: 'top' }}
        />
      </View>

      <AppButton label="Submit Disposition" onPress={submit} loading={submitting} fullWidth size="lg" icon="checkmark-done-outline" />
    </View>
  );
}
