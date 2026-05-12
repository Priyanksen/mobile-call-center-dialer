import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { GradientHeader } from '@/components/common/GradientHeader';
import { Callback } from '@/types/callback';
import { CallRouteType } from '@/types/call';
import { RoutePickerSheet } from '@/components/calls/RoutePickerSheet';
import { callbacksApi } from '@/api/callbacksApi';
import { callsApi } from '@/api/callsApi';
import { useCallbackNotifications } from '@/hooks/useCallbackNotifications';
import { formatDate, relativeFromNow } from '@/utils/formatDate';
import { RootStackParamList } from '@/navigation/types';

export function CallbackListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [data, setData] = useState<Callback[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickingFor, setPickingFor] = useState<Callback | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await callbacksApi.list());
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  useCallbackNotifications(data);

  const sorted = useMemo(
    () => [...data].sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()),
    [data],
  );

  const overdueCount = useMemo(
    () => sorted.filter((c) => c.status === 'pending' && new Date(c.scheduled_at).getTime() < Date.now()).length,
    [sorted],
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const startCall = async (routeType: CallRouteType) => {
    const cb = pickingFor;
    if (!cb || !cb.phone) return;
    try {
      const call = await callsApi.initiate({
        lead_id: cb.lead_id,
        phone: cb.phone,
        route_type: routeType,
      });
      navigation.navigate('Call', {
        callId: call.call_id,
        lead: {
          id: cb.lead_id,
          name: cb.customer_name ?? 'Lead',
          phone: cb.phone,
          status: 'callback',
          priority: 'medium',
        },
        routeType,
      });
    } catch (e) {
      Alert.alert('Call failed', (e as Error).message);
    }
  };

  return (
    <View className="flex-1 bg-bg dark:bg-ink-900">
      <GradientHeader
        title="Callbacks"
        subtitle={`${sorted.length} scheduled${overdueCount ? ` • ${overdueCount} overdue` : ''}`}
        right={
          overdueCount ? (
            <View className="px-3 py-1.5 rounded-full flex-row items-center" style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}>
              <View className="w-1.5 h-1.5 rounded-full bg-rose-300 mr-1.5" />
              <Text className="text-white text-xs font-bold">{overdueCount} OVERDUE</Text>
            </View>
          ) : null
        }
      />
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(c) => String(c.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#444CE7" />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState title="No callbacks" message="Scheduled callbacks will appear here." icon="alarm-outline" />
          }
          renderItem={({ item }) => {
            const overdue = new Date(item.scheduled_at).getTime() < Date.now() && item.status === 'pending';
            return (
              <View
                className="mb-3 bg-white dark:bg-ink-800 rounded-2xl border border-ink-200 dark:border-ink-700 overflow-hidden flex-row"
                style={{ elevation: 1 }}
              >
                <View className={`w-1.5 ${overdue ? 'bg-rose-500' : 'bg-amber-500'}`} />
                <View className="flex-1 p-4">
                  <View className="flex-row items-start">
                    <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${overdue ? 'bg-rose-50' : 'bg-amber-50'}`}>
                      <Ionicons name="alarm-outline" size={18} color={overdue ? '#EF4444' : '#F59E0B'} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-ink-900 dark:text-white font-semibold">{item.customer_name ?? `Lead #${item.lead_id}`}</Text>
                      <View className="flex-row items-center mt-0.5">
                        <Ionicons name="call-outline" size={12} color="#64748B" />
                        <Text className="text-ink-500 dark:text-ink-400 text-sm ml-1">{item.phone}</Text>
                      </View>
                      <Text className={`text-xs mt-1 font-medium ${overdue ? 'text-rose-600' : 'text-ink-700 dark:text-ink-200'}`}>
                        {formatDate(item.scheduled_at)} ({relativeFromNow(item.scheduled_at)})
                      </Text>
                    </View>
                    <StatusBadge label={overdue ? 'overdue' : item.status} tone={overdue ? 'red' : 'yellow'} />
                  </View>
                  {item.notes ? (
                    <Text className="text-ink-700 dark:text-ink-200 text-sm mt-3 bg-ink-50 dark:bg-ink-700 px-3 py-2 rounded-lg">{item.notes}</Text>
                  ) : null}
                  <View className="flex-row gap-2 mt-3">
                    <Pressable
                      onPress={() => setPickingFor(item)}
                      className="flex-1 bg-emerald-500 active:opacity-80 rounded-xl py-2.5 flex-row items-center justify-center"
                      style={{ elevation: 2 }}
                    >
                      <Ionicons name="call" size={16} color="#fff" />
                      <Text className="text-white font-semibold ml-2">Call</Text>
                    </Pressable>
                    <Pressable
                      onPress={() =>
                        navigation.navigate('ScheduleCallback', {
                          lead: {
                            id: item.lead_id,
                            name: item.customer_name ?? 'Lead',
                            phone: item.phone ?? '',
                            status: 'callback',
                            priority: 'medium',
                          },
                        })
                      }
                      className="flex-1 bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 active:opacity-80 rounded-xl py-2.5 flex-row items-center justify-center"
                    >
                      <Ionicons name="calendar-outline" size={16} color="#0B1220" />
                      <Text className="text-ink-800 dark:text-white font-semibold ml-2">Reschedule</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
      <RoutePickerSheet
        visible={!!pickingFor}
        onClose={() => setPickingFor(null)}
        onPick={startCall}
      />
    </View>
  );
}
