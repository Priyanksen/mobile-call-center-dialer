import React, { useEffect } from 'react';
import { Alert, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CallControlButton } from '@/components/calls/CallControlButton';
import { CallStatusBadge } from '@/components/calls/CallStatusBadge';
import { CallTimer } from '@/components/calls/CallTimer';
import { useCallPolling } from '@/hooks/useCallPolling';
import { useCallStore } from '@/store/callStore';
import { CallStatus } from '@/types/call';
import { RootStackParamList } from '@/navigation/types';
import { callsApi } from '@/api/callsApi';

type R = RouteProp<RootStackParamList, 'Call'>;

const TERMINAL: CallStatus[] = ['completed', 'failed', 'busy', 'no_answer'];

export function CallScreen() {
  const route = useRoute<R>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { callId, lead, routeType } = route.params;

  const status = useCallStore((s) => s.status);
  const duration = useCallStore((s) => s.duration);
  const applyStatus = useCallStore((s) => s.applyStatus);
  const clear = useCallStore((s) => s.clear);

  useEffect(() => {
    applyStatus('initiating');
    return () => clear();
  }, [applyStatus, clear]);

  useCallPolling(callId);

  useEffect(() => {
    if (status && TERMINAL.includes(status)) {
      const t = setTimeout(() => {
        navigation.replace('Disposition', { callId, lead });
      }, 800);
      return () => clearTimeout(t);
    }
  }, [status, callId, lead, navigation]);

  const hangup = async () => {
    try {
      await callsApi.hangup(callId);
      applyStatus('completed');
    } catch {
      Alert.alert('Hangup failed', 'Could not end the call. Try again.');
    }
  };

  const initial = lead.name.trim().charAt(0).toUpperCase();

  return (
    <View className="flex-1 bg-ink-900">
      <LinearGradient
        colors={['#0B1220', '#1E293B', '#3538CD']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
      />
      <SafeAreaView edges={['top', 'bottom']} className="flex-1">
        <View className="flex-1 items-center justify-between py-10 px-6">
          <View className="items-center">
            <View className="px-3 py-1 rounded-full bg-white/10 mb-4">
              <Text className="text-white/70 text-[10px] font-bold uppercase tracking-widest">
                {routeType} call
              </Text>
            </View>
            <View
              className="w-28 h-28 rounded-full bg-white/10 items-center justify-center mb-4 border-2 border-white/20"
              style={{ elevation: 8 }}
            >
              <Text className="text-white text-4xl font-bold">{initial}</Text>
            </View>
            <Text className="text-white text-2xl font-bold">{lead.name}</Text>
            <Text className="text-white/70 mt-1 text-base">{lead.phone}</Text>
            {lead.campaign_name ? (
              <Text className="text-white/50 text-xs mt-1">{lead.campaign_name}</Text>
            ) : null}
            <View className="mt-4">
              <CallStatusBadge status={status} />
            </View>
          </View>

          <View className="items-center">
            <CallTimer status={status} syncedDuration={duration} />
          </View>

          <View className="w-full">
            <View className="flex-row justify-around mb-10">
              <CallControlButton label="Mute" icon="mic-off-outline" variant="muted" disabled />
              <CallControlButton label="Hold" icon="pause-outline" variant="muted" disabled />
              <CallControlButton label="Speaker" icon="volume-high-outline" variant="muted" disabled />
              <CallControlButton label="Keypad" icon="keypad-outline" variant="muted" disabled />
            </View>
            <View className="items-center">
              <CallControlButton label="End call" icon="call" variant="danger" large onPress={hangup} />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
