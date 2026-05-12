import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { StatCard } from '@/components/dashboard/StatCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { GradientHeader } from '@/components/common/GradientHeader';
import { Campaign } from '@/types/campaign';
import { campaignsApi } from '@/api/campaignsApi';
import { RootStackParamList } from '@/navigation/types';

type R = RouteProp<RootStackParamList, 'CampaignDetail'>;

export function CampaignDetailScreen() {
  const { params } = useRoute<R>();
  const [c, setC] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setC(await campaignsApi.detail(params.campaignId));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [params.campaignId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading)
    return (
      <View className="flex-1 bg-bg dark:bg-ink-900">
        <GradientHeader title="Campaign" />
        <LoadingState />
      </View>
    );
  if (error || !c)
    return (
      <View className="flex-1 bg-bg dark:bg-ink-900">
        <GradientHeader title="Campaign" />
        <ErrorState message={error ?? 'Not found'} onRetry={load} />
      </View>
    );

  const progress = c.total_leads ? Math.round((c.completed_leads / c.total_leads) * 100) : 0;

  return (
    <View className="flex-1 bg-bg dark:bg-ink-900">
      <GradientHeader title="Campaign" subtitle={c.name} />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
      <View
        className="bg-white dark:bg-ink-800 rounded-3xl p-5 mb-3"
        style={{ elevation: 2 }}
      >
        <View className="flex-row items-start">
          <View className="w-14 h-14 rounded-2xl bg-violet-50 items-center justify-center mr-3">
            <Ionicons name="megaphone" size={26} color="#8B5CF6" />
          </View>
          <View className="flex-1 pr-2">
            <Text className="text-ink-900 dark:text-white text-lg font-bold">{c.name}</Text>
            <View className="flex-row items-center mt-1 flex-wrap">
              <View className="px-2 py-0.5 rounded bg-ink-100 dark:bg-ink-700 mr-1.5 mb-1">
                <Text className="text-[10px] font-bold text-ink-600 dark:text-ink-300">{c.campaign_type.toUpperCase()}</Text>
              </View>
              <View className="px-2 py-0.5 rounded bg-ink-100 dark:bg-ink-700 mb-1">
                <Text className="text-[10px] font-bold text-ink-600 dark:text-ink-300">ROUTE: {c.calling_route.toUpperCase()}</Text>
              </View>
            </View>
          </View>
          <StatusBadge label={c.is_active ? 'active' : 'paused'} tone={c.is_active ? 'green' : 'gray'} />
        </View>

        <View className="mt-4">
          <View className="flex-row justify-between mb-1">
            <Text className="text-xs text-ink-500 dark:text-ink-400 font-semibold">Completion</Text>
            <Text className="text-xs font-bold text-ink-800 dark:text-white">{progress}%</Text>
          </View>
          <View className="h-2 bg-ink-100 dark:bg-ink-700 rounded-full overflow-hidden">
            <View className="h-full bg-brand-600 rounded-full" style={{ width: `${progress}%` }} />
          </View>
        </View>
      </View>

      <View className="flex-row flex-wrap">
        <StatCard label="Total" value={c.total_leads} icon="people-outline" tone="brand" />
        <StatCard label="Pending" value={c.pending_leads} icon="hourglass-outline" tone="warn" />
      </View>
      <View className="flex-row flex-wrap">
        <StatCard label="Completed" value={c.completed_leads} icon="checkmark-done-outline" tone="sky" />
        <StatCard label="Connected" value={c.connected_calls} icon="call-outline" tone="success" />
      </View>
      <View className="flex-row flex-wrap">
        <StatCard label="Conversion" value={`${c.conversion_rate}%`} icon="trophy-outline" tone="violet" />
        <View className="flex-1 mr-2 mb-2" />
      </View>
      </ScrollView>
    </View>
  );
}
