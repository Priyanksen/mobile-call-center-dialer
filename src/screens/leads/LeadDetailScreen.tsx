import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppButton } from '@/components/common/AppButton';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { SectionHeader } from '@/components/common/SectionHeader';
import { BottomSheet } from '@/components/common/BottomSheet';
import { GradientHeader } from '@/components/common/GradientHeader';
import { StatusBadge, leadStatusTone, priorityTone, callStatusTone } from '@/components/common/StatusBadge';
import { RoutePickerSheet } from '@/components/calls/RoutePickerSheet';
import { Lead } from '@/types/lead';
import { Call, CallRouteType } from '@/types/call';
import { leadsApi } from '@/api/leadsApi';
import { callsApi } from '@/api/callsApi';
import { formatDate } from '@/utils/formatDate';
import { formatDuration } from '@/utils/formatDuration';
import { RootStackParamList } from '@/navigation/types';

type R = RouteProp<RootStackParamList, 'LeadDetail'>;

export function LeadDetailScreen() {
  const route = useRoute<R>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { leadId } = route.params;

  const [lead, setLead] = useState<Lead | null>(null);
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calling, setCalling] = useState(false);
  const [routeOpen, setRouteOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [l, history] = await Promise.all([
        leadsApi.detail(leadId),
        callsApi.list({ lead_id: leadId }).catch(() => [] as Call[]),
      ]);
      setLead(l);
      setCalls(history.filter((c) => c.lead_id === leadId).slice(0, 5));
    } catch (e) {
      setError((e as Error).message || 'Could not load lead.');
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    void load();
  }, [load]);

  const startCall = async (routeType: CallRouteType) => {
    if (!lead) return;
    setCalling(true);
    try {
      const call = await callsApi.initiate({
        lead_id: lead.id,
        phone: lead.phone,
        route_type: routeType,
      });
      navigation.navigate('Call', { callId: call.call_id, lead, routeType });
    } catch (e) {
      Alert.alert('Call failed', (e as Error).message || 'Could not start the call.');
    } finally {
      setCalling(false);
    }
  };

  const updateStatus = async (status: Lead['status']) => {
    if (!lead) return;
    try {
      const updated = await leadsApi.update(lead.id, { status });
      setLead(updated);
    } catch {
      Alert.alert('Update failed', 'Could not update lead status.');
    }
  };

  const saveNote = async () => {
    if (!lead || !noteText.trim()) return;
    setSavingNote(true);
    const merged = lead.notes ? `${lead.notes}\n\n${noteText.trim()}` : noteText.trim();
    try {
      const updated = await leadsApi.update(lead.id, { notes: merged });
      setLead(updated);
      setNoteOpen(false);
      setNoteText('');
    } catch {
      Alert.alert('Save failed', 'Could not save the note.');
    } finally {
      setSavingNote(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error || !lead) return <ErrorState message={error ?? 'Lead not found.'} onRetry={load} />;

  const initial = lead.name.trim().charAt(0).toUpperCase();

  return (
    <View className="flex-1 bg-bg dark:bg-ink-900">
      <GradientHeader title="Lead Details" subtitle={lead.name} />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white dark:bg-ink-800 rounded-3xl p-5 mb-3" style={{ elevation: 2 }}>
          <View className="items-center">
            <View className="w-20 h-20 rounded-3xl bg-brand-50 items-center justify-center mb-3">
              <Text className="text-brand-700 text-3xl font-bold">{initial}</Text>
            </View>
            <Text className="text-ink-900 dark:text-white text-xl font-bold">{lead.name}</Text>
            <View className="flex-row items-center mt-1">
              <Ionicons name="call-outline" size={14} color="#64748B" />
              <Text className="text-ink-500 dark:text-ink-400 ml-1.5">{lead.phone}</Text>
            </View>
            {lead.email ? (
              <View className="flex-row items-center mt-1">
                <Ionicons name="mail-outline" size={14} color="#64748B" />
                <Text className="text-ink-500 dark:text-ink-400 ml-1.5">{lead.email}</Text>
              </View>
            ) : null}
            {lead.city ? (
              <View className="flex-row items-center mt-1">
                <Ionicons name="location-outline" size={14} color="#64748B" />
                <Text className="text-ink-500 dark:text-ink-400 ml-1.5">{lead.city}</Text>
              </View>
            ) : null}
            <View className="flex-row gap-2 mt-3">
              <StatusBadge label={lead.status.replace('_', ' ')} tone={leadStatusTone(lead.status)} />
              <StatusBadge label={lead.priority} tone={priorityTone(lead.priority)} />
            </View>
          </View>
        </View>

        <View className="bg-white dark:bg-ink-800 rounded-2xl p-4 mb-3 border border-ink-200 dark:border-ink-700" style={{ elevation: 1 }}>
          <Row icon="megaphone-outline" label="Campaign" value={lead.campaign_name ?? '—'} />
          <Row icon="time-outline" label="Last call" value={formatDate(lead.last_called_at)} />
          <Row icon="alarm-outline" label="Next callback" value={formatDate(lead.next_callback_at)} last />
        </View>

        {lead.notes ? (
          <View className="bg-white dark:bg-ink-800 rounded-2xl p-4 mb-3 border border-ink-200 dark:border-ink-700" style={{ elevation: 1 }}>
            <SectionHeader title="Notes" />
            <Text className="text-ink-700 dark:text-ink-200 leading-5">{lead.notes}</Text>
          </View>
        ) : null}

        {calls.length ? (
          <View className="bg-white dark:bg-ink-800 rounded-2xl p-4 mb-3 border border-ink-200 dark:border-ink-700" style={{ elevation: 1 }}>
            <SectionHeader title="Recent calls" subtitle={`${calls.length} most recent`} />
            {calls.map((c) => (
              <View key={c.call_id} className="flex-row items-center py-2.5 border-b border-ink-100 dark:border-ink-700 last:border-0">
                <View className="w-8 h-8 rounded-lg bg-ink-50 dark:bg-ink-700 items-center justify-center mr-3">
                  <Ionicons name="call-outline" size={14} color="#64748B" />
                </View>
                <View className="flex-1">
                  <Text className="text-ink-900 dark:text-white text-sm font-semibold">{formatDate(c.started_at)}</Text>
                  <Text className="text-ink-500 dark:text-ink-400 text-xs">
                    {formatDuration(c.duration ?? 0)} • {c.route_type.toUpperCase()}
                    {c.disposition ? ` • ${c.disposition.replace('_', ' ')}` : ''}
                  </Text>
                </View>
                <StatusBadge label={c.status.replace('_', ' ')} tone={callStatusTone(c.status)} />
              </View>
            ))}
          </View>
        ) : null}

        <AppButton
          label={calling ? 'Starting…' : 'Call Now'}
          onPress={() => setRouteOpen(true)}
          loading={calling}
          fullWidth
          size="lg"
          variant="success"
          icon="call"
        />
        <View className="h-3" />
        <View className="flex-row gap-2">
          <View className="flex-1">
            <AppButton
              label="Schedule"
              variant="secondary"
              icon="alarm-outline"
              fullWidth
              onPress={() => navigation.navigate('ScheduleCallback', { lead })}
            />
          </View>
          <View className="flex-1">
            <AppButton
              label="Add Note"
              variant="ghost"
              icon="create-outline"
              fullWidth
              onPress={() => setNoteOpen(true)}
            />
          </View>
        </View>
        <View className="h-3" />
        <View className="flex-row gap-2">
          <View className="flex-1">
            <AppButton
              label="Interested"
              variant="ghost"
              icon="checkmark-circle-outline"
              fullWidth
              onPress={() => updateStatus('interested')}
            />
          </View>
          <View className="flex-1">
            <AppButton
              label="Not Interested"
              variant="ghost"
              icon="close-circle-outline"
              fullWidth
              onPress={() => updateStatus('not_interested')}
            />
          </View>
        </View>
      </ScrollView>

      <RoutePickerSheet visible={routeOpen} onClose={() => setRouteOpen(false)} onPick={startCall} />

      <BottomSheet visible={noteOpen} onClose={() => setNoteOpen(false)} title="Add note">
        <TextInput
          value={noteText}
          onChangeText={setNoteText}
          multiline
          autoFocus
          placeholder="Type your note about this lead…"
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

function Row({
  icon,
  label,
  value,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View className={`flex-row items-center py-2.5 ${last ? '' : 'border-b border-ink-100 dark:border-ink-700'}`}>
      <Ionicons name={icon} size={18} color="#64748B" style={{ marginRight: 12 }} />
      <Text className="text-ink-500 dark:text-ink-400 flex-1">{label}</Text>
      <Text className="text-ink-900 dark:text-white font-semibold text-right max-w-[60%]" numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}
