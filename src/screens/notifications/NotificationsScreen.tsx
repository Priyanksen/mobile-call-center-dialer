import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { GradientHeader } from '@/components/common/GradientHeader';
import { AppNotification } from '@/types/notification';
import { notificationsApi } from '@/api/notificationsApi';
import { formatDate } from '@/utils/formatDate';

const typeIcon: Record<AppNotification['type'], { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
  callback: { icon: 'alarm-outline', color: '#F59E0B', bg: 'bg-amber-50' },
  lead: { icon: 'person-add-outline', color: '#0EA5E9', bg: 'bg-sky-50' },
  campaign: { icon: 'megaphone-outline', color: '#8B5CF6', bg: 'bg-violet-50' },
  system: { icon: 'information-circle-outline', color: '#64748B', bg: 'bg-ink-100 dark:bg-ink-700' },
};

export function NotificationsScreen() {
  const [data, setData] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await notificationsApi.list());
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

  const markRead = async (n: AppNotification) => {
    setData((d) => d.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
    try {
      await notificationsApi.markRead(n.id);
    } catch {
      // silent
    }
  };

  const unread = data.filter((n) => !n.is_read).length;

  return (
    <View className="flex-1 bg-bg dark:bg-ink-900">
      <GradientHeader title="Notifications" subtitle={unread ? `${unread} unread` : 'All caught up'} />
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
    <FlatList
      data={data}
      keyExtractor={(n) => String(n.id)}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#444CE7" />}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={<EmptyState title="No notifications" message="You're all caught up." icon="notifications-outline" />}
      renderItem={({ item }) => {
        const t = typeIcon[item.type];
        return (
          <Pressable
            onPress={() => !item.is_read && markRead(item)}
            className={`mb-3 bg-white dark:bg-ink-800 rounded-2xl p-4 border active:opacity-80 ${
              item.is_read ? 'border-ink-200 dark:border-ink-700' : 'border-brand-200'
            }`}
            style={{ elevation: 1 }}
          >
            <View className="flex-row items-start">
              <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${t.bg}`}>
                <Ionicons name={t.icon} size={18} color={t.color} />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="text-ink-900 dark:text-white font-semibold flex-1">{item.title}</Text>
                  {!item.is_read ? (
                    <View className="w-2 h-2 rounded-full bg-brand-600 ml-2" />
                  ) : null}
                </View>
                <Text className="text-ink-700 dark:text-ink-200 text-sm mt-0.5">{item.body}</Text>
                <Text className="text-xs text-ink-400 dark:text-ink-500 mt-2">{formatDate(item.created_at)}</Text>
              </View>
            </View>
          </Pressable>
        );
      }}
    />
      )}
    </View>
  );
}
