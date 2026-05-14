import React, { useEffect } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppButton } from '@/components/common/AppButton';
import { LoadingState } from '@/components/common/LoadingState';
import { useAgentStore } from '@/store/agentStore';
import { useAuthStore } from '@/store/authStore';
import { ENV } from '@/config/env';
import { RootStackParamList } from '@/navigation/types';

const STATUS_VISUAL: Record<string, { bg: string; icon: keyof typeof Ionicons.glyphMap; label: string }> = {
  available: { bg: '#10B981', icon: 'checkmark', label: 'Available' },
  busy: { bg: '#EF4444', icon: 'remove', label: 'Busy' },
  break: { bg: '#F59E0B', icon: 'cafe', label: 'Break' },
  offline: { bg: '#94A3B8', icon: 'moon', label: 'Offline' },
};

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { agent, stats, loading, load } = useAgentStore();
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    if (!agent) void load();
  }, [agent, load]);

  if (loading && !agent) return <LoadingState />;

  const initial = (agent?.name ?? 'A').trim().charAt(0).toUpperCase();
  const statusKey = agent?.status ?? 'offline';
  const sv = STATUS_VISUAL[statusKey] ?? STATUS_VISUAL.offline;
  const connectRate = stats && stats.total_calls > 0 ? Math.round((stats.connected_calls / stats.total_calls) * 100) : 0;

  return (
    <View className="flex-1 bg-bg dark:bg-ink-900">
      {/* Pinned purple hero */}
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 16,
          paddingBottom: 18,
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

        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-white text-xl font-bold">Profile</Text>
          <Pressable
            onPress={() => navigation.navigate('EditProfile')}
            className="px-3 py-1.5 rounded-full bg-white/20 flex-row items-center"
          >
            <Ionicons name="create-outline" size={14} color="#fff" />
            <Text className="text-white text-xs font-semibold ml-1.5">Edit</Text>
          </Pressable>
        </View>

        <View className="flex-row items-center">
          <View
            className="w-20 h-20 rounded-3xl bg-white/15 items-center justify-center overflow-hidden"
            style={{ position: 'relative' }}
          >
            {agent?.avatar_url ? (
              <Image
                source={{ uri: agent.avatar_url }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            ) : (
              <Text className="text-white text-3xl font-bold">{initial}</Text>
            )}
          </View>
          <View className="flex-1 ml-4">
            <Text className="text-white text-xl font-bold" numberOfLines={1}>
              {agent?.name ?? '—'}
            </Text>
            <Text className="text-white/80 text-sm mt-0.5" numberOfLines={1}>
              {agent?.email ?? ''}
            </Text>
            <View className="flex-row items-center mt-2">
              <View
                className="px-2 py-1 rounded-full flex-row items-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                <View className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: sv.bg }} />
                <Text className="text-white text-[10px] font-bold uppercase tracking-wide">{sv.label}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Scrollable area */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Today snapshot — single performance card */}
        <View
          className="bg-white dark:bg-ink-800 rounded-2xl border border-ink-200 dark:border-ink-700 p-4 mb-4"
          style={{ elevation: 1 }}
        >
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-ink-500 dark:text-ink-400 text-[11px] font-bold uppercase tracking-wide">
                Today's snapshot
              </Text>
              <Text className="text-ink-900 dark:text-white text-2xl font-bold mt-1">
                {stats?.connected_calls ?? 0}
                <Text className="text-ink-400 dark:text-ink-500 text-base font-semibold"> / {stats?.total_calls ?? 0}</Text>
              </Text>
              <Text className="text-ink-500 dark:text-ink-400 text-xs">Connected of total</Text>
            </View>
            <View className="w-14 h-14 rounded-2xl bg-emerald-50 items-center justify-center">
              <Text className="text-emerald-700 text-base font-bold">{connectRate}%</Text>
            </View>
          </View>
          <View className="h-1.5 bg-ink-100 dark:bg-ink-700 rounded-full overflow-hidden mb-3">
            <View className="h-full bg-emerald-500 rounded-full" style={{ width: `${connectRate}%` }} />
          </View>
          <View className="flex-row">
            <SnapshotCell color="#0EA5E9" bg="bg-sky-50" icon="time-outline" value={stats?.callbacks_due ?? 0} label="Follow-ups" />
            <SnapshotCell color="#EF4444" bg="bg-rose-50" icon="close-circle-outline" value={stats?.missed_calls ?? 0} label="Missed" />
            <SnapshotCell color="#8B5CF6" bg="bg-violet-50" icon="trophy-outline" value={stats?.conversions ?? 0} label="Wins" />
          </View>
        </View>

        {/* Telephony details */}
        <Text className="text-ink-500 dark:text-ink-400 text-xs uppercase font-bold mt-1 mb-2 ml-1 tracking-wide">
          Telephony
        </Text>
        <View className="bg-white dark:bg-ink-800 rounded-2xl border border-ink-200 dark:border-ink-700 mb-3 overflow-hidden" style={{ elevation: 1 }}>
          <InfoRow icon="at-outline" color="#0EA5E9" bg="bg-sky-50" label="Username" value={agent?.username ?? '—'} />
          <Divider />
          <InfoRow icon="call-outline" color="#10B981" bg="bg-emerald-50" label="Extension" value={agent?.extension ?? '—'} />
          <Divider />
          <InfoRow icon="server-outline" color="#8B5CF6" bg="bg-violet-50" label="SIP user" value={agent?.sip_username ?? '—'} />
        </View>

        {/* Preferences */}
        <Text className="text-ink-500 dark:text-ink-400 text-xs uppercase font-bold mt-2 mb-2 ml-1 tracking-wide">
          Preferences
        </Text>
        <View className="bg-white dark:bg-ink-800 rounded-2xl border border-ink-200 dark:border-ink-700 mb-3 overflow-hidden" style={{ elevation: 1 }}>
          <MenuRow
            icon="notifications-outline"
            color="#F59E0B"
            bg="bg-amber-50"
            label="Notifications"
            onPress={() => navigation.navigate('Notifications')}
          />
          <Divider />
          <MenuRow
            icon="settings-outline"
            color="#64748B"
            bg="bg-ink-100 dark:bg-ink-700"
            label="App settings"
            onPress={() => navigation.navigate('Settings')}
          />
        </View>

        {/* Support & legal */}
        <Text className="text-ink-500 dark:text-ink-400 text-xs uppercase font-bold mt-2 mb-2 ml-1 tracking-wide">
          Support
        </Text>
        <View className="bg-white dark:bg-ink-800 rounded-2xl border border-ink-200 dark:border-ink-700 mb-3 overflow-hidden" style={{ elevation: 1 }}>
          <MenuRow
            icon="help-circle-outline"
            color="#0EA5E9"
            bg="bg-sky-50"
            label="Help & support"
            onPress={() => navigation.navigate('HelpSupport')}
          />
          <Divider />
          <MenuRow
            icon="document-text-outline"
            color="#8B5CF6"
            bg="bg-violet-50"
            label="Terms & privacy"
            onPress={() => navigation.navigate('TermsPrivacy')}
          />
        </View>

        {/* Sign out */}
        <View className="mt-2 mb-3">
          <AppButton
            label="Sign out"
            variant="danger"
            fullWidth
            icon="log-out-outline"
            onPress={() => void logout()}
          />
        </View>

        <Text className="text-center text-ink-400 dark:text-ink-500 text-xs">
          Agent Dialer • v{ENV.APP_VERSION}
        </Text>
      </ScrollView>
    </View>
  );
}

function InfoRow({
  icon,
  color,
  bg,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center px-4 py-3">
      <View className={`w-9 h-9 rounded-xl ${bg} items-center justify-center mr-3`}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text className="text-ink-700 dark:text-ink-200 flex-1">{label}</Text>
      <Text className="text-ink-900 dark:text-white font-semibold">{value}</Text>
    </View>
  );
}

function MenuRow({
  icon,
  color,
  bg,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center px-4 py-3 active:bg-ink-50 dark:bg-ink-700">
      <View className={`w-9 h-9 rounded-xl ${bg} items-center justify-center mr-3`}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text className="text-ink-900 dark:text-white font-semibold flex-1">{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
    </Pressable>
  );
}

function SnapshotCell({
  icon,
  color,
  bg,
  value,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  value: number | string;
  label: string;
}) {
  return (
    <View className="flex-1 items-center">
      <View className={`w-8 h-8 rounded-lg ${bg} items-center justify-center mb-1`}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text className="text-ink-900 dark:text-white text-base font-bold">{value}</Text>
      <Text className="text-ink-500 dark:text-ink-400 text-[10px] font-semibold uppercase">{label}</Text>
    </View>
  );
}

function Divider() {
  return <View className="h-px bg-ink-100 dark:bg-ink-700 ml-16" />;
}
