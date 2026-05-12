import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/common/AppButton';
import { GradientHeader } from '@/components/common/GradientHeader';
import { ENV } from '@/config/env';
import { useAuthStore } from '@/store/authStore';

export function SettingsScreen() {
  const logout = useAuthStore((s) => s.logout);
  return (
    <View className="flex-1 bg-bg dark:bg-ink-900">
      <GradientHeader title="Settings" subtitle="App preferences & info" />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
      <Text className="text-ink-500 dark:text-ink-400 text-xs uppercase font-bold mb-2">Connection</Text>
      <View className="bg-white dark:bg-ink-800 rounded-2xl p-4 mb-4 border border-ink-200 dark:border-ink-700" style={{ elevation: 1 }}>
        <View className="flex-row items-center mb-1">
          <Ionicons name="globe-outline" size={16} color="#64748B" />
          <Text className="text-ink-500 dark:text-ink-400 text-xs ml-2 font-semibold uppercase">API Base URL</Text>
        </View>
        <Text className="text-ink-900 dark:text-white mt-1 font-mono text-sm">{ENV.API_BASE_URL}</Text>
        <Text className="text-ink-400 dark:text-ink-500 text-xs mt-2">
          Edit <Text className="font-mono">extra.API_BASE_URL</Text> in app.json to change.
        </Text>
      </View>

      <Text className="text-ink-500 dark:text-ink-400 text-xs uppercase font-bold mb-2">App info</Text>
      <View className="bg-white dark:bg-ink-800 rounded-2xl p-2 mb-4 border border-ink-200 dark:border-ink-700" style={{ elevation: 1 }}>
        <Row icon="apps-outline" label="App version" value={ENV.APP_VERSION} />
        <Row icon="bug-outline" label="Mock fallback" value={ENV.USE_MOCK_FALLBACK ? 'on (dev)' : 'off'} />
        <Row icon="pulse-outline" label="Poll interval" value={`${ENV.CALL_POLL_INTERVAL_MS} ms`} last />
      </View>

      <AppButton label="Sign out" variant="danger" fullWidth icon="log-out-outline" onPress={() => void logout()} />

      <Text className="text-center text-ink-400 dark:text-ink-500 text-xs mt-6">
        Dialer Mobile v{ENV.APP_VERSION}
      </Text>
      </ScrollView>
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
    <View className={`flex-row items-center px-2 py-3 ${last ? '' : 'border-b border-ink-100 dark:border-ink-700'}`}>
      <Ionicons name={icon} size={18} color="#64748B" style={{ marginRight: 12 }} />
      <Text className="text-ink-500 dark:text-ink-400 flex-1">{label}</Text>
      <Text className="text-ink-900 dark:text-white font-semibold">{value}</Text>
    </View>
  );
}
