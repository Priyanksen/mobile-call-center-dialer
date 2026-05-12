import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { GradientHeader } from '@/components/common/GradientHeader';
import { Campaign } from '@/types/campaign';
import { campaignsApi } from '@/api/campaignsApi';
import { RootStackParamList } from '@/navigation/types';

export function CampaignListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [data, setData] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await campaignsApi.list());
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

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
      <GradientHeader title="Campaigns" subtitle={`${data.length} ${data.length === 1 ? 'campaign' : 'campaigns'}`} />
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
    <FlatList
      data={data}
      keyExtractor={(c) => String(c.id)}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#444CE7" />}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={<EmptyState title="No campaigns" message="Active campaigns will appear here." icon="megaphone-outline" />}
      renderItem={({ item }) => {
        const progress = item.total_leads ? Math.round((item.completed_leads / item.total_leads) * 100) : 0;
        return (
          <Pressable
            onPress={() => navigation.navigate('CampaignDetail', { campaignId: item.id })}
            className="mb-3 bg-white dark:bg-ink-800 rounded-2xl border border-ink-200 dark:border-ink-700 active:opacity-80 p-4"
            style={{ elevation: 1 }}
          >
            <View className="flex-row items-start">
              <View className="w-11 h-11 rounded-xl bg-violet-50 items-center justify-center mr-3">
                <Ionicons name="megaphone" size={20} color="#8B5CF6" />
              </View>
              <View className="flex-1 pr-2">
                <Text className="text-ink-900 dark:text-white font-semibold">{item.name}</Text>
                <View className="flex-row items-center mt-0.5 flex-wrap">
                  <View className="px-2 py-0.5 rounded bg-ink-100 dark:bg-ink-700 mr-1.5">
                    <Text className="text-[10px] font-bold text-ink-600 dark:text-ink-300">{item.campaign_type.toUpperCase()}</Text>
                  </View>
                  <View className="px-2 py-0.5 rounded bg-ink-100 dark:bg-ink-700">
                    <Text className="text-[10px] font-bold text-ink-600 dark:text-ink-300">{item.calling_route.toUpperCase()}</Text>
                  </View>
                </View>
              </View>
              <StatusBadge label={item.is_active ? 'active' : 'paused'} tone={item.is_active ? 'green' : 'gray'} />
            </View>

            <View className="mt-3">
              <View className="flex-row justify-between mb-1">
                <Text className="text-xs text-ink-500 dark:text-ink-400">Progress</Text>
                <Text className="text-xs font-semibold text-ink-700 dark:text-ink-200">{progress}%</Text>
              </View>
              <View className="h-2 bg-ink-100 dark:bg-ink-700 rounded-full overflow-hidden">
                <View className="h-full bg-brand-600 rounded-full" style={{ width: `${progress}%` }} />
              </View>
            </View>

            <View className="flex-row mt-3 pt-3 border-t border-ink-100 dark:border-ink-700 gap-4">
              <Stat label="Total" value={item.total_leads} />
              <Stat label="Pending" value={item.pending_leads} />
              <Stat label="Conv" value={`${item.conversion_rate}%`} />
            </View>
          </Pressable>
        );
      }}
    />
      )}
    </View>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <View>
      <Text className="text-[10px] uppercase font-bold text-ink-400 dark:text-ink-500">{label}</Text>
      <Text className="text-ink-900 dark:text-white font-bold">{value}</Text>
    </View>
  );
}
