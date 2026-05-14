import React from 'react';
import { Alert, Linking, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Lead } from '@/types/lead';
import { normalizePhone } from '@/utils/phone';

interface Props {
  lead: Lead;
}

function openLink(url: string, label: string) {
  Linking.canOpenURL(url).then((can) => {
    if (can) Linking.openURL(url);
    else Alert.alert('Unavailable', `No app installed to handle ${label}.`);
  });
}

export function ContactActionsRow({ lead }: Props) {
  const phone = normalizePhone(lead.phone);
  const phoneIntl = phone.startsWith('+') ? phone.slice(1) : phone;
  const greeting = `Hi ${lead.name.split(' ')[0] ?? ''},`.trim();

  const onWhatsApp = () => {
    const text = encodeURIComponent(
      `${greeting}\nI'm reaching out from ${lead.campaign_name ?? 'Bol7'}. Could we connect for a quick chat?`,
    );
    openLink(`https://wa.me/${phoneIntl}?text=${text}`, 'WhatsApp');
  };

  const onEmail = () => {
    if (!lead.email) {
      Alert.alert('No email', 'This lead has no email on file.');
      return;
    }
    const subject = encodeURIComponent(`Following up — ${lead.campaign_name ?? 'Bol7'}`);
    const body = encodeURIComponent(
      `${greeting}\n\nI'm following up regarding your interest. Please let me know a convenient time to talk.\n\nThanks,\nAgent Dialer`,
    );
    openLink(`mailto:${lead.email}?subject=${subject}&body=${body}`, 'Email');
  };

  const onSms = () => {
    const body = encodeURIComponent(
      `${greeting} Following up from ${lead.campaign_name ?? 'Bol7'}. Is now a good time to talk?`,
    );
    openLink(`sms:${phone}?body=${body}`, 'SMS');
  };

  return (
    <View
      className="bg-white dark:bg-ink-800 rounded-2xl border border-ink-200 dark:border-ink-700 p-3 mb-3"
      style={{ elevation: 1 }}
    >
      <Text className="text-ink-500 dark:text-ink-400 text-[11px] font-bold uppercase tracking-wider mb-2 px-1">
        Contact via
      </Text>
      <View className="flex-row">
        <ActionTile
          icon="logo-whatsapp"
          label="WhatsApp"
          color="#25D366"
          bg="bg-emerald-50"
          onPress={onWhatsApp}
        />
        <ActionTile
          icon="mail-outline"
          label="Email"
          color="#444CE7"
          bg="bg-brand-50"
          onPress={onEmail}
          disabled={!lead.email}
        />
        <ActionTile
          icon="chatbox-outline"
          label="SMS"
          color="#0EA5E9"
          bg="bg-sky-50"
          onPress={onSms}
        />
      </View>
    </View>
  );
}

function ActionTile({
  icon,
  label,
  color,
  bg,
  onPress,
  disabled,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  bg: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="flex-1 items-center py-2 rounded-xl mx-0.5 active:bg-ink-50 dark:active:bg-ink-700"
      style={{ opacity: disabled ? 0.4 : 1 }}
    >
      <View className={`w-11 h-11 rounded-2xl items-center justify-center mb-1 ${bg}`}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text className="text-ink-700 dark:text-ink-200 text-xs font-semibold">{label}</Text>
    </Pressable>
  );
}
