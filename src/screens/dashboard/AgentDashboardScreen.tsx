import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Image, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActionCard } from '@/components/dashboard/QuickActionCard';
import { SlideToAction } from '@/components/dashboard/SlideToAction';
import { LoadingState } from '@/components/common/LoadingState';
import { useAgentStore } from '@/store/agentStore';
import { useAgentStatus } from '@/hooks/useAgentStatus';
import { AgentStatus } from '@/types/agent';
import { leadsApi } from '@/api/leadsApi';
import { RootStackParamList } from '@/navigation/types';

const STATUSES: {
  label: string;
  value: AgentStatus;
  bg: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}[] = [
  { label: 'Available', value: 'available', bg: 'bg-emerald-500', icon: 'checkmark-circle', color: '#10B981' },
  { label: 'Busy', value: 'busy', bg: 'bg-rose-500', icon: 'remove-circle', color: '#EF4444' },
  { label: 'Break', value: 'break', bg: 'bg-amber-500', icon: 'cafe', color: '#F59E0B' },
  { label: 'Offline', value: 'offline', bg: 'bg-ink-500', icon: 'moon', color: '#64748B' },
];

export function AgentDashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { agent, stats, loading, load, refreshStats } = useAgentStore();
  const { status, change } = useAgentStatus();
  const [refreshing, setRefreshing] = useState(false);
  const [gettingNext, setGettingNext] = useState(false);

  useEffect(() => {
    void load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const getNextLead = async () => {
    setGettingNext(true);
    try {
      const next = await leadsApi.next();
      if (next) navigation.navigate('LeadDetail', { leadId: next.id });
      else Alert.alert('No leads', 'No more leads assigned right now.');
    } catch {
      Alert.alert('Error', 'Could not fetch the next lead.');
    } finally {
      setGettingNext(false);
      void refreshStats();
    }
  };

  if (loading && !agent) return <LoadingState />;

  const initial = (agent?.name ?? 'A').trim().charAt(0).toUpperCase();
  const connectRate = stats && stats.total_calls > 0 ? Math.round((stats.connected_calls / stats.total_calls) * 100) : 0;

  return (
    <View className="flex-1 bg-bg dark:bg-ink-900">
      {/* Pinned header with gradient */}
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 16,
          paddingBottom: 16,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          overflow: 'hidden',
        }}
      >
        <LinearGradient
          colors={['#3538CD', '#6172F3']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center flex-1">
            <View className="w-12 h-12 rounded-2xl bg-white/20 items-center justify-center mr-3 overflow-hidden">
              {agent?.avatar_url ? (
                <Image
                  source={{ uri: agent.avatar_url }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-white text-lg font-bold">{initial}</Text>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-white/80 text-xs">Welcome back,</Text>
              <Text className="text-white text-lg font-bold" numberOfLines={1}>
                {agent?.name ?? 'Agent'}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => navigation.navigate('Notifications')}
            className="w-10 h-10 rounded-full bg-white/15 items-center justify-center"
          >
            <Ionicons name="notifications-outline" size={20} color="#fff" />
          </Pressable>
        </View>

        <View
          className="bg-white dark:bg-ink-800 rounded-2xl p-3.5"
          style={{
            elevation: 4,
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
          }}
        >
          <View className="flex-row items-center justify-between mb-2.5">
            <Text className="text-ink-500 dark:text-ink-400 text-[11px] font-bold uppercase tracking-wide">Your status</Text>
            {(() => {
              const cur = STATUSES.find((s) => s.value === status) ?? STATUSES[3];
              return <Ionicons name={cur.icon} size={20} color={cur.color} />;
            })()}
          </View>
          <View className="flex-row -mr-1.5">
            {STATUSES.map((s) => {
              const active = status === s.value;
              return (
                <Pressable
                  key={s.value}
                  onPress={() => void change(s.value)}
                  className={`flex-1 mr-1.5 py-2 rounded-xl items-center ${active ? s.bg : 'bg-ink-100 dark:bg-ink-700'}`}
                >
                  <Text className={`text-[11px] font-bold ${active ? 'text-white' : 'text-ink-600 dark:text-ink-300'}`}>
                    {s.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {/* Scrollable area */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#444CE7" />}
        showsVerticalScrollIndicator={false}
      >
        {/* Performance card */}
        <View
          className="bg-white dark:bg-ink-800 rounded-2xl p-4 mb-4 border border-ink-200 dark:border-ink-700"
          style={{ elevation: 1 }}
        >
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-ink-500 dark:text-ink-400 text-[11px] font-bold uppercase tracking-wide">
                Today's performance
              </Text>
              <Text className="text-ink-900 dark:text-white text-2xl font-bold mt-1">
                {stats?.connected_calls ?? 0}
                <Text className="text-ink-400 dark:text-ink-500 text-base font-semibold"> / {stats?.total_calls ?? 0}</Text>
              </Text>
              <Text className="text-ink-500 dark:text-ink-400 text-xs">Connected of total calls</Text>
            </View>
            <View className="w-14 h-14 rounded-2xl bg-emerald-50 items-center justify-center">
              <Text className="text-emerald-700 text-base font-bold">{connectRate}%</Text>
            </View>
          </View>
          <View className="h-2 bg-ink-100 dark:bg-ink-700 rounded-full overflow-hidden">
            <View className="h-full bg-emerald-500 rounded-full" style={{ width: `${connectRate}%` }} />
          </View>
        </View>

        {/* Primary CTA — slide to get next lead */}
        <SlideToAction
          label={gettingNext ? 'Fetching lead…' : 'Get Next Lead'}
          hint="Ready to dial"
          icon="call"
          busy={gettingNext}
          onComplete={getNextLead}
        />

        {/* Stat grid */}
        <Text className="text-ink-900 dark:text-white font-bold text-base mb-2">Today's overview</Text>
        <View className="flex-row flex-wrap">
          <StatCard label="Total calls" value={stats?.total_calls ?? 0} icon="call-outline" tone="brand" />
          <StatCard label="Missed" value={stats?.missed_calls ?? 0} icon="close-circle-outline" tone="danger" />
        </View>
        <View className="flex-row flex-wrap mb-2">
          <StatCard label="Callbacks" value={stats?.callbacks_due ?? 0} icon="time-outline" tone="warn" />
          <StatCard label="Conversions" value={stats?.conversions ?? 0} icon="trophy-outline" tone="violet" />
        </View>

        {/* Quick actions */}
        <Text className="text-ink-900 dark:text-white font-bold text-base mb-2">Quick actions</Text>
        <View className="flex-row flex-wrap">
          <QuickActionCard
            icon="people-outline"
            label="My Leads"
            tone="sky"
            onPress={() => navigation.navigate('Main', { screen: 'Leads' } as never)}
          />
          <QuickActionCard
            icon="time-outline"
            label="Callbacks"
            tone="warn"
            onPress={() => navigation.navigate('Main', { screen: 'Callbacks' } as never)}
          />
        </View>
        <View className="flex-row flex-wrap">
          <QuickActionCard
            icon="receipt-outline"
            label="History"
            tone="success"
            onPress={() => navigation.navigate('Main', { screen: 'History' } as never)}
          />
          <QuickActionCard
            icon="megaphone-outline"
            label="Campaigns"
            tone="violet"
            onPress={() => navigation.navigate('CampaignList')}
          />
        </View>
        <View className="flex-row flex-wrap">
          <QuickActionCard
            icon="stats-chart-outline"
            label="Reports"
            tone="brand"
            onPress={() => navigation.navigate('Reports')}
          />
          <QuickActionCard
            icon="notifications-outline"
            label="Alerts"
            tone="rose"
            onPress={() => navigation.navigate('Notifications')}
          />
        </View>
        <View className="flex-row flex-wrap">
          <QuickActionCard
            icon="settings-outline"
            label="Settings"
            tone="sky"
            onPress={() => navigation.navigate('Settings')}
          />
          <View className="flex-1 mr-2 mb-2" />
        </View>
      </ScrollView>
    </View>
  );
}
