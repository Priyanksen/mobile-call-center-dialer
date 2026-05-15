import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CallStatusBadge } from '@/components/calls/CallStatusBadge';
import { CallTimer } from '@/components/calls/CallTimer';
import { useCallPolling } from '@/hooks/useCallPolling';
import { useCallStore } from '@/store/callStore';
import { CallStatus } from '@/types/call';
import { RootStackParamList } from '@/navigation/types';
import { callsApi } from '@/api/callsApi';

type R = RouteProp<RootStackParamList, 'Call'>;

const TERMINAL: CallStatus[] = ['completed', 'failed', 'busy', 'no_answer'];

const KEYS: { d: string; sub?: string }[] = [
  { d: '1' },
  { d: '2', sub: 'ABC' },
  { d: '3', sub: 'DEF' },
  { d: '4', sub: 'GHI' },
  { d: '5', sub: 'JKL' },
  { d: '6', sub: 'MNO' },
  { d: '7', sub: 'PQRS' },
  { d: '8', sub: 'TUV' },
  { d: '9', sub: 'WXYZ' },
  { d: '*' },
  { d: '0', sub: '+' },
  { d: '#' },
];

export function CallScreen() {
  const route = useRoute<R>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { callId, lead, routeType } = route.params;

  const status = useCallStore((s) => s.status);
  const duration = useCallStore((s) => s.duration);
  const applyStatus = useCallStore((s) => s.applyStatus);
  const clear = useCallStore((s) => s.clear);

  // Local dialer state — all visual, no API
  const [muted, setMuted] = useState(false);
  const [onHold, setOnHold] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(false);
  const [recording, setRecording] = useState(true);

  const [keypadOpen, setKeypadOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  const [dialed, setDialed] = useState('');
  const [note, setNote] = useState('');
  const [transferTo, setTransferTo] = useState('');

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
        <View className="flex-1 px-6">
          {/* Top status row */}
          <View className="flex-row items-center justify-between mt-2">
            <View className="px-3 py-1 rounded-full bg-white/10 flex-row items-center">
              <Ionicons name="call" size={11} color="#fff" />
              <Text className="text-white/80 text-[10px] font-bold uppercase tracking-widest ml-1.5">
                {routeType} call
              </Text>
            </View>
            <View
              className={`px-3 py-1 rounded-full flex-row items-center ${
                recording ? 'bg-rose-500/30' : 'bg-white/10'
              }`}
            >
              <View
                className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                  recording ? 'bg-rose-400' : 'bg-white/40'
                }`}
              />
              <Text className="text-white text-[10px] font-bold uppercase tracking-widest">
                {recording ? 'Rec' : 'Rec off'}
              </Text>
            </View>
          </View>

          {/* Customer */}
          <View className="items-center mt-6">
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
            {onHold ? (
              <View className="mt-2 px-3 py-1 rounded-full bg-amber-500/30 flex-row items-center">
                <Ionicons name="pause" size={11} color="#FCD34D" />
                <Text className="text-amber-200 text-[10px] font-bold uppercase tracking-widest ml-1.5">
                  On hold
                </Text>
              </View>
            ) : null}
          </View>

          {/* Timer */}
          <View className="items-center my-6">
            <CallTimer status={status} syncedDuration={duration} />
          </View>

          <View className="flex-1" />

          {/* Control grid */}
          <View className="mb-4">
            <View className="flex-row justify-around mb-5">
              <Tile
                icon={muted ? 'mic-off' : 'mic-outline'}
                label={muted ? 'Unmute' : 'Mute'}
                active={muted}
                onPress={() => setMuted((v) => !v)}
              />
              <Tile
                icon={onHold ? 'play' : 'pause-outline'}
                label={onHold ? 'Resume' : 'Hold'}
                active={onHold}
                onPress={() => setOnHold((v) => !v)}
              />
              <Tile
                icon={speakerOn ? 'volume-high' : 'volume-medium-outline'}
                label="Speaker"
                active={speakerOn}
                onPress={() => setSpeakerOn((v) => !v)}
              />
              <Tile
                icon="keypad-outline"
                label="Keypad"
                onPress={() => setKeypadOpen(true)}
              />
            </View>
            <View className="flex-row justify-around mb-6">
              <Tile
                icon="create-outline"
                label="Add note"
                onPress={() => setNoteOpen(true)}
              />
              <Tile
                icon="git-branch-outline"
                label="Transfer"
                onPress={() => setTransferOpen(true)}
              />
              <Tile
                icon={recording ? 'radio-button-on' : 'radio-button-off'}
                label={recording ? 'Stop rec' : 'Record'}
                active={recording}
                tone={recording ? 'danger' : undefined}
                onPress={() => setRecording((v) => !v)}
              />
              <Tile
                icon="people-outline"
                label="Add"
                onPress={() => Alert.alert('Coming soon', 'Conference / add caller will be wired with the SIP backend.')}
              />
            </View>

            {/* End call */}
            <View className="items-center">
              <Pressable
                onPress={hangup}
                className="w-20 h-20 rounded-full bg-rose-500 items-center justify-center active:opacity-80"
                style={{
                  elevation: 10,
                  shadowColor: '#F43F5E',
                  shadowOpacity: 0.5,
                  shadowRadius: 18,
                  shadowOffset: { width: 0, height: 6 },
                }}
              >
                <Ionicons name="call" size={32} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
              </Pressable>
              <Text className="text-white/60 text-[11px] mt-2 font-semibold">End call</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* Keypad overlay */}
      <Modal
        visible={keypadOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setKeypadOpen(false)}
      >
        <Pressable className="flex-1 bg-black/60" onPress={() => setKeypadOpen(false)}>
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="mt-auto rounded-t-3xl px-5 pt-4 bg-ink-900"
            style={{ paddingBottom: 24 + insets.bottom }}
          >
            <View className="w-12 h-1.5 bg-white/20 rounded-full self-center mb-4" />
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-white text-lg font-bold">Keypad</Text>
              <Pressable onPress={() => setKeypadOpen(false)} hitSlop={10}>
                <Ionicons name="close" size={22} color="#94A3B8" />
              </Pressable>
            </View>
            <View
              className="bg-white/5 rounded-2xl px-4 py-3 mb-4 flex-row items-center justify-between"
              style={{ minHeight: 52 }}
            >
              <Text className="text-white text-xl font-light tracking-widest flex-1" numberOfLines={1}>
                {dialed || '—'}
              </Text>
              {dialed ? (
                <Pressable onPress={() => setDialed((d) => d.slice(0, -1))} hitSlop={8}>
                  <Ionicons name="backspace-outline" size={20} color="#94A3B8" />
                </Pressable>
              ) : null}
            </View>
            <View className="flex-row flex-wrap">
              {KEYS.map((k) => (
                <Pressable
                  key={k.d}
                  onPress={() => setDialed((d) => d + k.d)}
                  className="items-center justify-center bg-white/10 active:bg-white/20"
                  style={{
                    width: '30%',
                    aspectRatio: 1.6,
                    margin: '1.66%',
                    borderRadius: 16,
                  }}
                >
                  <Text className="text-white text-2xl font-semibold">{k.d}</Text>
                  {k.sub ? (
                    <Text className="text-white/50 text-[10px] font-bold tracking-widest mt-0.5">
                      {k.sub}
                    </Text>
                  ) : null}
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Add note overlay */}
      <Modal visible={noteOpen} animationType="slide" transparent onRequestClose={() => setNoteOpen(false)}>
        <Pressable className="flex-1 bg-black/60" onPress={() => setNoteOpen(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ marginTop: 'auto' }}>
            <Pressable
              onPress={(e) => e.stopPropagation()}
              className="rounded-t-3xl px-5 pt-4 bg-white dark:bg-ink-800"
              style={{ paddingBottom: 24 + insets.bottom }}
            >
              <View className="w-12 h-1.5 bg-ink-200 rounded-full self-center mb-4" />
              <Text className="text-ink-900 dark:text-white text-lg font-bold mb-3">Mid-call note</Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Jot something down…"
                placeholderTextColor="#94A3B8"
                multiline
                autoFocus
                className="bg-ink-50 dark:bg-ink-700 rounded-xl px-3 py-3 text-ink-900 dark:text-white text-base mb-3"
                style={{ minHeight: 100, textAlignVertical: 'top' }}
              />
              <Pressable
                onPress={() => {
                  setNoteOpen(false);
                  setNote('');
                  Alert.alert('Saved', 'Note attached to this call.');
                }}
                className="bg-brand-600 rounded-xl py-3 items-center active:bg-brand-700"
              >
                <Text className="text-white font-bold">Save note</Text>
              </Pressable>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>

      {/* Transfer overlay */}
      <Modal visible={transferOpen} animationType="slide" transparent onRequestClose={() => setTransferOpen(false)}>
        <Pressable className="flex-1 bg-black/60" onPress={() => setTransferOpen(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ marginTop: 'auto' }}>
            <Pressable
              onPress={(e) => e.stopPropagation()}
              className="rounded-t-3xl px-5 pt-4 bg-white dark:bg-ink-800"
              style={{ paddingBottom: 24 + insets.bottom }}
            >
              <View className="w-12 h-1.5 bg-ink-200 rounded-full self-center mb-4" />
              <Text className="text-ink-900 dark:text-white text-lg font-bold mb-1">Transfer call</Text>
              <Text className="text-ink-500 dark:text-ink-400 text-xs mb-3">
                Forward this call to another agent or external number.
              </Text>
              <TextInput
                value={transferTo}
                onChangeText={setTransferTo}
                placeholder="Extension or phone number"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                autoFocus
                className="bg-ink-50 dark:bg-ink-700 rounded-xl px-4 py-3 text-ink-900 dark:text-white text-base mb-3"
              />
              <Pressable
                onPress={() => {
                  if (!transferTo.trim()) return;
                  setTransferOpen(false);
                  setTransferTo('');
                  Alert.alert('Transferring', `Call is being forwarded to ${transferTo}.`);
                }}
                className="bg-brand-600 rounded-xl py-3 items-center active:bg-brand-700"
              >
                <Text className="text-white font-bold">Transfer now</Text>
              </Pressable>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </View>
  );
}

function Tile({
  icon,
  label,
  active,
  onPress,
  tone,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  onPress?: () => void;
  tone?: 'danger';
}) {
  const bg = active
    ? tone === 'danger'
      ? 'bg-rose-500'
      : 'bg-white'
    : 'bg-white/10';
  const iconColor = active ? (tone === 'danger' ? '#fff' : '#0B1220') : '#fff';
  return (
    <View className="items-center" style={{ width: 76 }}>
      <Pressable
        onPress={onPress}
        className={`w-[68px] h-[68px] rounded-full items-center justify-center ${bg} active:opacity-80`}
        style={{
          borderWidth: active ? 0 : 1,
          borderColor: 'rgba(255,255,255,0.18)',
        }}
      >
        <Ionicons name={icon} size={30} color={iconColor} />
      </Pressable>
      <Text className="text-white/80 text-[12px] mt-2 font-medium" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
