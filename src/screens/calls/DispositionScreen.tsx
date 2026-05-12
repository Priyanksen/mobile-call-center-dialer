import React, { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DispositionForm } from '@/components/calls/DispositionForm';
import { GradientHeader } from '@/components/common/GradientHeader';
import { callsApi } from '@/api/callsApi';
import { RootStackParamList } from '@/navigation/types';

type R = RouteProp<RootStackParamList, 'Disposition'>;

export function DispositionScreen() {
  const route = useRoute<R>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { callId, lead } = route.params;
  const [submitting, setSubmitting] = useState(false);

  const submit = async (req: Parameters<typeof callsApi.disposition>[0]) => {
    setSubmitting(true);
    try {
      await callsApi.disposition(req);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Main' as never }],
        }),
      );
    } catch (e) {
      Alert.alert('Submit failed', (e as Error).message || 'Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const initial = lead.name.trim().charAt(0).toUpperCase();

  return (
    <View className="flex-1 bg-bg dark:bg-ink-900">
      <GradientHeader title="Call Outcome" subtitle={lead.name} hideBack />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      <View
        className="bg-white dark:bg-ink-800 rounded-3xl p-4 mb-3 flex-row items-center"
        style={{ elevation: 2 }}
      >
        <View className="w-14 h-14 rounded-2xl bg-brand-50 items-center justify-center mr-3">
          <Text className="text-brand-700 text-xl font-bold">{initial}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-ink-500 dark:text-ink-400 text-xs font-semibold uppercase">Customer</Text>
          <Text className="text-ink-900 dark:text-white text-base font-bold mt-0.5">{lead.name}</Text>
          <View className="flex-row items-center mt-0.5">
            <Ionicons name="call-outline" size={12} color="#64748B" />
            <Text className="text-ink-500 dark:text-ink-400 text-xs ml-1">{lead.phone}</Text>
          </View>
        </View>
      </View>

      <View className="bg-white dark:bg-ink-800 rounded-2xl p-4 border border-ink-200 dark:border-ink-700" style={{ elevation: 1 }}>
        <Text className="text-ink-900 dark:text-white text-base font-bold mb-3">Call outcome</Text>
        <DispositionForm callId={callId} leadId={lead.id} submitting={submitting} onSubmit={submit} />
      </View>
      </ScrollView>
    </View>
  );
}
