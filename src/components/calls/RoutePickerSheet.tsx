import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from '@/components/common/BottomSheet';
import { CallRouteType } from '@/types/call';

interface Props {
  visible: boolean;
  onClose: () => void;
  onPick: (route: CallRouteType) => void;
  defaultRoute?: CallRouteType;
}

interface Opt {
  value: CallRouteType;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  bg: string;
  color: string;
}

const OPTIONS: Opt[] = [
  {
    value: 'sip',
    label: 'SIP',
    description: 'Route through Asterisk SIP trunk',
    icon: 'cloud-outline',
    bg: 'bg-brand-50',
    color: '#444CE7',
  },
  {
    value: 'sim',
    label: 'SIM / GSM',
    description: 'Route through GSM gateway',
    icon: 'hardware-chip-outline',
    bg: 'bg-emerald-50',
    color: '#10B981',
  },
  {
    value: 'voip',
    label: 'VoIP',
    description: 'Route via VoIP provider (Twilio etc.)',
    icon: 'globe-outline',
    bg: 'bg-violet-50',
    color: '#8B5CF6',
  },
];

export function RoutePickerSheet({ visible, onClose, onPick }: Props) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Pick calling route">
      <View>
        {OPTIONS.map((o) => (
          <Pressable
            key={o.value}
            onPress={() => {
              onPick(o.value);
              onClose();
            }}
            className="flex-row items-center p-3 mb-2 rounded-2xl border border-ink-200 dark:border-ink-700 active:bg-ink-50 dark:bg-ink-700"
          >
            <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-3 ${o.bg}`}>
              <Ionicons name={o.icon} size={22} color={o.color} />
            </View>
            <View className="flex-1">
              <Text className="text-ink-900 dark:text-white font-bold text-base">{o.label}</Text>
              <Text className="text-ink-500 dark:text-ink-400 text-xs mt-0.5">{o.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </Pressable>
        ))}
      </View>
    </BottomSheet>
  );
}
