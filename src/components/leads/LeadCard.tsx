import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Lead } from '@/types/lead';
import { StatusBadge, leadStatusTone } from '@/components/common/StatusBadge';
import { formatDate } from '@/utils/formatDate';

interface Props {
  lead: Lead;
  onPress?: () => void;
}

const priorityColor: Record<Lead['priority'], string> = {
  urgent: 'bg-rose-500',
  high: 'bg-amber-500',
  medium: 'bg-sky-500',
  low: 'bg-ink-300',
};

export function LeadCard({ lead, onPress }: Props) {
  const initial = lead.name.trim().charAt(0).toUpperCase();
  return (
    <Pressable
      onPress={onPress}
      className="mb-3 bg-white dark:bg-ink-800 rounded-2xl border border-ink-200 dark:border-ink-700 active:opacity-80 overflow-hidden flex-row"
      style={{ elevation: 1 }}
    >
      <View className={`w-1.5 ${priorityColor[lead.priority]}`} />
      <View className="flex-1 p-4">
        <View className="flex-row items-start">
          <View className="w-11 h-11 rounded-full bg-brand-50 items-center justify-center mr-3">
            <Text className="text-brand-700 text-base font-bold">{initial}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-ink-900 dark:text-white text-base font-semibold">{lead.name}</Text>
            <View className="flex-row items-center mt-0.5">
              <Ionicons name="call-outline" size={12} color="#64748B" />
              <Text className="text-ink-500 dark:text-ink-400 text-sm ml-1">{lead.phone}</Text>
            </View>
            {lead.campaign_name ? (
              <View className="flex-row items-center mt-1">
                <Ionicons name="megaphone-outline" size={11} color="#94A3B8" />
                <Text className="text-ink-400 dark:text-ink-500 text-xs ml-1">{lead.campaign_name}</Text>
              </View>
            ) : null}
          </View>
          <StatusBadge label={lead.status.replace('_', ' ')} tone={leadStatusTone(lead.status)} />
        </View>

        {lead.next_callback_at || lead.last_called_at ? (
          <View className="mt-3 pt-3 border-t border-ink-100 dark:border-ink-700 flex-row items-center">
            <Ionicons
              name={lead.next_callback_at ? 'alarm-outline' : 'time-outline'}
              size={13}
              color="#64748B"
            />
            <Text className="text-xs text-ink-500 dark:text-ink-400 ml-1.5">
              {lead.next_callback_at
                ? `Follow-up: ${formatDate(lead.next_callback_at)}`
                : `Last called: ${formatDate(lead.last_called_at)}`}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
