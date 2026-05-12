import React, { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/common/AppButton';
import { BottomSheet } from '@/components/common/BottomSheet';
import { GradientHeader } from '@/components/common/GradientHeader';

const FAQS = [
  {
    q: 'How do I place a call?',
    a: 'Open any lead from the Leads tab or tap Get Next Lead on the Dashboard. On the lead detail, tap Call Now and pick a route (SIP, SIM or VoIP). The backend originates the call and the CallScreen shows the live status.',
  },
  {
    q: 'My call status is stuck on “initiating”.',
    a: 'The app polls /api/calls/{id}/status/ every 2 seconds. If your backend or Asterisk is unreachable the status will not advance. Check that the backend is running and that your phone can reach it at the API URL set in Settings.',
  },
  {
    q: 'How do callback reminders work?',
    a: 'Reminders are local notifications scheduled with expo-notifications. The first time you open the Callbacks tab you will be asked for notification permission. After that, every pending callback fires a notification at its scheduled time.',
  },
  {
    q: 'Why does my status say it failed to update?',
    a: 'Status changes go to PATCH /api/agents/me/status/. If your backend is not running the change still applies locally in dev mode. With the backend running, this means the server rejected the request — check your agent permissions.',
  },
  {
    q: 'How do I change the API URL?',
    a: 'Open app.json and edit extra.API_BASE_URL. Reload the app afterwards. The current value is visible in Settings.',
  },
];

const CONTACT = {
  email: 'support@bol7.com',
  phone: '+91 90000 00000',
  hours: 'Mon–Sat, 10am–7pm IST',
};

export function HelpSupportScreen() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const submitTicket = () => {
    if (!subject.trim() || !body.trim()) {
      Alert.alert('Missing details', 'Please fill in subject and message.');
      return;
    }
    setTicketOpen(false);
    setSubject('');
    setBody('');
    Alert.alert('Sent', 'Your support request has been recorded. We will get back within 24h.');
  };

  return (
    <View className="flex-1 bg-bg dark:bg-ink-900">
      <GradientHeader title="Help & Support" subtitle="We're here to help" />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-ink-500 dark:text-ink-400 text-xs uppercase font-bold mb-2 ml-1 tracking-wide">
          Contact us
        </Text>
        <View className="bg-white dark:bg-ink-800 rounded-2xl border border-ink-200 dark:border-ink-700 mb-4 overflow-hidden" style={{ elevation: 1 }}>
          <ContactRow
            icon="mail-outline"
            color="#444CE7"
            bg="bg-brand-50"
            label="Email"
            value={CONTACT.email}
            onPress={() => Linking.openURL(`mailto:${CONTACT.email}`)}
          />
          <View className="h-px bg-ink-100 dark:bg-ink-700 ml-16" />
          <ContactRow
            icon="call-outline"
            color="#10B981"
            bg="bg-emerald-50"
            label="Phone"
            value={CONTACT.phone}
            onPress={() => Linking.openURL(`tel:${CONTACT.phone.replace(/\s/g, '')}`)}
          />
          <View className="h-px bg-ink-100 dark:bg-ink-700 ml-16" />
          <View className="flex-row items-center px-4 py-3">
            <View className="w-9 h-9 rounded-xl bg-amber-50 items-center justify-center mr-3">
              <Ionicons name="time-outline" size={18} color="#F59E0B" />
            </View>
            <Text className="text-ink-700 dark:text-ink-200 flex-1">Support hours</Text>
            <Text className="text-ink-900 dark:text-white font-semibold">{CONTACT.hours}</Text>
          </View>
        </View>

        <Pressable
          onPress={() => setTicketOpen(true)}
          className="bg-brand-600 active:bg-brand-700 rounded-2xl p-4 mb-4 flex-row items-center"
          style={{ elevation: 2 }}
        >
          <View className="w-11 h-11 rounded-2xl bg-white/15 items-center justify-center mr-3">
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-base font-bold">Raise a ticket</Text>
            <Text className="text-white/80 text-xs">We aim to respond within 24 hours</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </Pressable>

        <Text className="text-ink-500 dark:text-ink-400 text-xs uppercase font-bold mb-2 ml-1 tracking-wide">
          Frequently asked
        </Text>
        <View className="bg-white dark:bg-ink-800 rounded-2xl border border-ink-200 dark:border-ink-700 overflow-hidden" style={{ elevation: 1 }}>
          {FAQS.map((f, i) => {
            const open = openIdx === i;
            return (
              <View key={f.q}>
                <Pressable
                  onPress={() => setOpenIdx(open ? null : i)}
                  className="px-4 py-3 flex-row items-start active:bg-ink-50 dark:bg-ink-700"
                >
                  <View className="w-8 h-8 rounded-lg bg-brand-50 items-center justify-center mr-3 mt-0.5">
                    <Ionicons name="help" size={16} color="#444CE7" />
                  </View>
                  <Text className="text-ink-900 dark:text-white font-semibold flex-1 pr-2">{f.q}</Text>
                  <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color="#94A3B8" />
                </Pressable>
                {open ? (
                  <View className="px-4 pb-3 pl-[60]">
                    <Text className="text-ink-700 dark:text-ink-200 leading-5">{f.a}</Text>
                  </View>
                ) : null}
                {i < FAQS.length - 1 ? <View className="h-px bg-ink-100 dark:bg-ink-700 ml-16" /> : null}
              </View>
            );
          })}
        </View>
      </ScrollView>

      <BottomSheet visible={ticketOpen} onClose={() => setTicketOpen(false)} title="New support ticket">
        <Text className="text-sm text-ink-700 dark:text-ink-200 mb-1.5 font-semibold">Subject</Text>
        <TextInput
          value={subject}
          onChangeText={setSubject}
          placeholder="Brief summary"
          placeholderTextColor="#94A3B8"
          className="bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-xl px-4 py-3 text-ink-900 dark:text-white text-base mb-3"
        />
        <Text className="text-sm text-ink-700 dark:text-ink-200 mb-1.5 font-semibold">How can we help?</Text>
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder="Describe what's happening…"
          placeholderTextColor="#94A3B8"
          multiline
          className="bg-ink-50 dark:bg-ink-700 rounded-xl px-3 py-3 text-ink-900 dark:text-white text-base mb-4"
          style={{ minHeight: 120, textAlignVertical: 'top' }}
        />
        <AppButton label="Send ticket" onPress={submitTicket} fullWidth icon="send-outline" />
      </BottomSheet>
    </View>
  );
}

function ContactRow({
  icon,
  color,
  bg,
  label,
  value,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center px-4 py-3 active:bg-ink-50 dark:bg-ink-700">
      <View className={`w-9 h-9 rounded-xl ${bg} items-center justify-center mr-3`}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text className="text-ink-700 dark:text-ink-200 flex-1">{label}</Text>
      <Text className="text-brand-700 font-semibold">{value}</Text>
    </Pressable>
  );
}
