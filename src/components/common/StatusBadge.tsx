import React from 'react';
import { Text, View } from 'react-native';

type Tone = 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'purple' | 'sky';

interface Props {
  label: string;
  tone?: Tone;
  dot?: boolean;
}

const toneClass: Record<Tone, { bg: string; text: string; dot: string }> = {
  green: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  yellow: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  red: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
  blue: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  sky: { bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-500' },
  gray: { bg: 'bg-ink-100 dark:bg-ink-700', text: 'text-ink-600 dark:text-ink-300', dot: 'bg-ink-400' },
  purple: { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500' },
};

export function StatusBadge({ label, tone = 'gray', dot = true }: Props) {
  const c = toneClass[tone];
  return (
    <View className={`px-2.5 py-1 rounded-full self-start flex-row items-center ${c.bg}`}>
      {dot ? <View className={`w-1.5 h-1.5 rounded-full mr-1.5 ${c.dot}`} /> : null}
      <Text className={`text-[11px] font-semibold uppercase tracking-wide ${c.text}`}>{label}</Text>
    </View>
  );
}

export function leadStatusTone(s: string): Tone {
  switch (s) {
    case 'new':
      return 'sky';
    case 'interested':
    case 'converted':
      return 'green';
    case 'callback':
      return 'yellow';
    case 'not_interested':
    case 'closed':
      return 'red';
    case 'contacted':
      return 'blue';
    default:
      return 'gray';
  }
}

export function priorityTone(p: string): Tone {
  switch (p) {
    case 'urgent':
      return 'red';
    case 'high':
      return 'yellow';
    case 'medium':
      return 'blue';
    default:
      return 'gray';
  }
}

export function callStatusTone(s: string): Tone {
  switch (s) {
    case 'connected':
    case 'answered':
      return 'green';
    case 'ringing':
    case 'initiating':
      return 'sky';
    case 'completed':
      return 'gray';
    case 'failed':
    case 'busy':
    case 'no_answer':
      return 'red';
    default:
      return 'gray';
  }
}

export function agentStatusTone(s: string): Tone {
  switch (s) {
    case 'available':
      return 'green';
    case 'busy':
      return 'red';
    case 'break':
      return 'yellow';
    default:
      return 'gray';
  }
}
