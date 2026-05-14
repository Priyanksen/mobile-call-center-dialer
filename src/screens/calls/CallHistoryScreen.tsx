import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Linking, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { FilterChip } from '@/components/common/FilterChip';
import { GradientHeader } from '@/components/common/GradientHeader';
import { CallStatusBadge } from '@/components/calls/CallStatusBadge';
import { Call, CallStatus } from '@/types/call';
import { callsApi } from '@/api/callsApi';
import { formatDate } from '@/utils/formatDate';
import { formatDuration } from '@/utils/formatDuration';

type Range = 'today' | 'yesterday' | 'last7';

const RANGES: { label: string; value: Range }[] = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 days', value: 'last7' },
];

function rangeParams(r: Range): Record<string, string> {
  const now = new Date();
  const day = (d: Date) => d.toISOString().slice(0, 10);
  if (r === 'today') return { date_from: day(now), date_to: day(now) };
  if (r === 'yesterday') {
    const y = new Date(now.getTime() - 86400000);
    return { date_from: day(y), date_to: day(y) };
  }
  const start = new Date(now.getTime() - 7 * 86400000);
  return { date_from: day(start), date_to: day(now) };
}

const directionIcon = (s: CallStatus): { name: keyof typeof Ionicons.glyphMap; color: string } => {
  if (s === 'completed' || s === 'connected' || s === 'answered')
    return { name: 'arrow-up-outline', color: '#10B981' };
  if (s === 'no_answer' || s === 'busy' || s === 'failed')
    return { name: 'close-outline', color: '#EF4444' };
  return { name: 'time-outline', color: '#64748B' };
};

export function CallHistoryScreen() {
  const [range, setRange] = useState<Range>('today');
  const [recOnly, setRecOnly] = useState(false);
  const [data, setData] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = useMemo(() => rangeParams(range), [range]);

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await callsApi.list(params));
    } catch (e) {
      setError((e as Error).message);
    }
  }, [params]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <View className="flex-1 bg-bg dark:bg-ink-900">
      <GradientHeader
        title="Call History"
        subtitle={`${recOnly ? data.filter((c) => c.recording_url).length : data.length} ${
          (recOnly ? data.filter((c) => c.recording_url).length : data.length) === 1 ? 'call' : 'calls'
        }`}
      />
      <View className="px-4 pt-3 pb-3 bg-white dark:bg-ink-800 border-b border-ink-100 dark:border-ink-700">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {RANGES.map((r) => (
            <FilterChip
              key={r.value}
              label={r.label}
              active={range === r.value}
              onPress={() => setRange(r.value)}
            />
          ))}
          <FilterChip
            label="🎙  Has recording"
            active={recOnly}
            onPress={() => setRecOnly((v) => !v)}
          />
        </ScrollView>
      </View>
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <FlatList
          data={recOnly ? data.filter((c) => c.recording_url) : data}
          keyExtractor={(c) => c.call_id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#444CE7" />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState title="No calls" message="Calls in this range will appear here." icon="call-outline" />}
          renderItem={({ item }) => {
            const di = directionIcon(item.status);
            return (
              <View className="mb-3 bg-white dark:bg-ink-800 rounded-2xl border border-ink-200 dark:border-ink-700 p-4" style={{ elevation: 1 }}>
                <View className="flex-row items-start">
                  <View className="w-10 h-10 rounded-xl bg-ink-50 dark:bg-ink-700 items-center justify-center mr-3">
                    <Ionicons name={di.name} size={18} color={di.color} />
                  </View>
                  <View className="flex-1 pr-2">
                    <Text className="text-ink-900 dark:text-white font-semibold">{item.customer_name ?? 'Unknown'}</Text>
                    <Text className="text-ink-500 dark:text-ink-400 text-sm">{item.phone}</Text>
                    {item.campaign_name ? (
                      <Text className="text-ink-400 dark:text-ink-500 text-xs mt-0.5">{item.campaign_name}</Text>
                    ) : null}
                  </View>
                  <CallStatusBadge status={item.status} />
                </View>
                <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-ink-100 dark:border-ink-700">
                  <View className="flex-row items-center">
                    <Ionicons name="calendar-outline" size={12} color="#94A3B8" />
                    <Text className="text-xs text-ink-500 dark:text-ink-400 ml-1">{formatDate(item.started_at)}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={12} color="#94A3B8" />
                    <Text className="text-xs text-ink-500 dark:text-ink-400 ml-1 mr-2">{formatDuration(item.duration ?? 0)}</Text>
                    <View className="px-2 py-0.5 rounded bg-ink-100 dark:bg-ink-700">
                      <Text className="text-[10px] font-bold text-ink-600 dark:text-ink-300">{item.route_type.toUpperCase()}</Text>
                    </View>
                  </View>
                </View>
                {item.disposition ? (
                  <View className="flex-row items-center mt-2">
                    <Ionicons name="bookmark-outline" size={12} color="#64748B" />
                    <Text className="text-xs text-ink-700 dark:text-ink-200 ml-1">
                      {item.disposition.replace('_', ' ')}
                    </Text>
                  </View>
                ) : null}
                {item.recording_url ? (
                  <Pressable
                    onPress={() => item.recording_url && Linking.openURL(item.recording_url)}
                    className="flex-row items-center mt-3 self-start px-3 py-1.5 rounded-full bg-brand-50 active:opacity-80"
                  >
                    <Ionicons name="play-circle" size={16} color="#444CE7" />
                    <Text className="text-brand-700 text-xs ml-1.5 font-bold">Play recording</Text>
                  </Pressable>
                ) : null}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}
