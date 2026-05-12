import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FilterChip } from '@/components/common/FilterChip';
import { GradientHeader } from '@/components/common/GradientHeader';

const TERMS = [
  {
    title: 'Use of the app',
    body:
      'Agent Dialer is provided to authorized call-center agents for the sole purpose of conducting customer outreach on behalf of the organization that issued you these credentials. You agree to use the app only for lawful business activity and in line with the calling regulations of your country (TRAI/DND in India, FCC/TCPA in the US, GDPR in the EU).',
  },
  {
    title: 'Account & access',
    body:
      'Your account is personal. Do not share your credentials. Your administrator can revoke access at any time. Sessions are protected by JWT tokens stored in the device keychain (Android EncryptedSharedPreferences / iOS Keychain).',
  },
  {
    title: 'Call recording',
    body:
      'Calls may be recorded for quality, training and compliance. Recordings are stored by the backend, not on the device. Always inform the customer at the start of a call that the conversation is being recorded if local law requires it.',
  },
  {
    title: 'Acceptable conduct',
    body:
      'Do not call numbers outside your assigned campaigns. Do not deliver misleading scripts. Do not abuse the disposition flow to mark genuine leads as bad numbers. Repeated violations may result in account suspension.',
  },
  {
    title: 'Updates & termination',
    body:
      'We may roll out updates, feature changes or shut-downs at any time. Critical telephony changes will be announced in-app or by email. You can stop using the app and request data export by contacting your administrator.',
  },
];

const PRIVACY = [
  {
    title: 'What we collect',
    body:
      'Account details you enter (name, email, extension, SIP user), the leads and campaigns assigned to you by the backend, call metadata (start/end time, duration, status, disposition, route), and locally scheduled callback reminders.',
  },
  {
    title: 'What we do NOT collect',
    body:
      'The mobile app does not collect contacts from your phone, your location, your microphone, the contents of other apps, nor analytics events. Local notifications are scheduled on-device by the OS, not sent through any third party.',
  },
  {
    title: 'Where data lives',
    body:
      'JWT access/refresh tokens are stored in Expo SecureStore (Android EncryptedSharedPreferences, iOS Keychain). All operational data (leads, calls, campaigns) lives on your organization\'s Django backend — the app never persists business data locally.',
  },
  {
    title: 'Third parties',
    body:
      'The app talks only to the backend API URL configured in app.json. The backend may forward call legs to Asterisk, a GSM gateway, or a VoIP provider (Twilio, Plivo, Exotel). Their privacy policies apply to those legs.',
  },
  {
    title: 'Your rights',
    body:
      'You can request a copy of your data, correction of inaccuracies, or deletion of your account. Contact your administrator or support@bol7.com. Responses within 30 days.',
  },
];

type Tab = 'terms' | 'privacy';

export function TermsPrivacyScreen() {
  const [tab, setTab] = useState<Tab>('terms');
  const data = tab === 'terms' ? TERMS : PRIVACY;
  return (
    <View className="flex-1 bg-bg dark:bg-ink-900">
      <GradientHeader title="Terms & Privacy" subtitle="Last updated: May 11, 2026" />
      <View className="px-4 py-3 bg-white dark:bg-ink-800 border-b border-ink-100 dark:border-ink-700 flex-row">
        <FilterChip label="Terms of use" active={tab === 'terms'} onPress={() => setTab('terms')} />
        <FilterChip label="Privacy policy" active={tab === 'privacy'} onPress={() => setTab('privacy')} />
      </View>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          className="bg-white dark:bg-ink-800 rounded-3xl p-5 mb-3 flex-row items-start"
          style={{ elevation: 2 }}
        >
          <View
            className={`w-12 h-12 rounded-2xl items-center justify-center mr-3 ${
              tab === 'terms' ? 'bg-brand-50' : 'bg-violet-50'
            }`}
          >
            <Ionicons
              name={tab === 'terms' ? 'document-text-outline' : 'shield-checkmark-outline'}
              size={22}
              color={tab === 'terms' ? '#444CE7' : '#8B5CF6'}
            />
          </View>
          <View className="flex-1">
            <Text className="text-ink-900 dark:text-white text-lg font-bold">
              {tab === 'terms' ? 'Terms of use' : 'Privacy policy'}
            </Text>
            <Text className="text-ink-500 dark:text-ink-400 text-xs mt-1">Last updated: May 11, 2026</Text>
          </View>
        </View>

        {data.map((s, i) => (
          <View
            key={s.title}
            className="bg-white dark:bg-ink-800 rounded-2xl border border-ink-200 dark:border-ink-700 p-4 mb-2.5"
            style={{ elevation: 1 }}
          >
            <View className="flex-row items-center mb-2">
              <View className="w-6 h-6 rounded-full bg-brand-50 items-center justify-center mr-2">
                <Text className="text-brand-700 text-xs font-bold">{i + 1}</Text>
              </View>
              <Text className="text-ink-900 dark:text-white font-bold flex-1">{s.title}</Text>
            </View>
            <Text className="text-ink-700 dark:text-ink-200 leading-5">{s.body}</Text>
          </View>
        ))}

        <Text className="text-ink-400 dark:text-ink-500 text-xs text-center mt-3">
          By using Agent Dialer you acknowledge these terms.
        </Text>
      </ScrollView>
    </View>
  );
}
