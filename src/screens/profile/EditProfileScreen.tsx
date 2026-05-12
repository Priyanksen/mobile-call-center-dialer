import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AppInput } from '@/components/common/AppInput';
import { AppButton } from '@/components/common/AppButton';
import { BottomSheet } from '@/components/common/BottomSheet';
import { GradientHeader } from '@/components/common/GradientHeader';
import { useAgentStore } from '@/store/agentStore';
import { isEmail, isNonEmpty } from '@/utils/validators';
import { pickAvatar } from '@/utils/imagePicker';

export function EditProfileScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const agent = useAgentStore((s) => s.agent);
  const updateProfile = useAgentStore((s) => s.updateProfile);

  const [name, setName] = useState(agent?.name ?? '');
  const [email, setEmail] = useState(agent?.email ?? '');
  const [extension, setExtension] = useState(agent?.extension ?? '');
  const [sipUsername, setSipUsername] = useState(agent?.sip_username ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(agent?.avatar_url ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [picking, setPicking] = useState(false);

  const initial = (name || agent?.name || 'A').trim().charAt(0).toUpperCase();

  const onPick = async (src: 'camera' | 'library') => {
    setPicking(false);
    const uri = await pickAvatar(src);
    if (uri) setAvatarUri(uri);
  };

  const removePhoto = () => {
    setPicking(false);
    setAvatarUri(null);
  };

  const submit = async () => {
    const next: typeof errors = {};
    if (!isNonEmpty(name)) next.name = 'Name is required.';
    if (email && !isEmail(email)) next.email = 'Invalid email address.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
        extension: extension.trim() || null,
        sip_username: sipUsername.trim() || null,
        avatar_url: avatarUri ?? null,
      });
      Alert.alert('Saved', 'Profile updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Update failed', (e as Error).message || 'Could not save profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-bg dark:bg-ink-900">
      <GradientHeader title="Edit Profile" subtitle={agent?.name} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            className="bg-white dark:bg-ink-800 rounded-3xl p-5 mb-3 items-center"
            style={{ elevation: 2 }}
          >
            <Pressable onPress={() => setPicking(true)} className="active:opacity-80">
              <View
                className="w-24 h-24 rounded-3xl bg-brand-50 items-center justify-center overflow-hidden"
                style={{ position: 'relative' }}
              >
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                ) : (
                  <Text className="text-brand-700 text-4xl font-bold">{initial}</Text>
                )}
                <View
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-brand-600 items-center justify-center border-2 border-white"
                >
                  <Ionicons name="camera" size={16} color="#fff" />
                </View>
              </View>
            </Pressable>
            <Text className="text-ink-500 dark:text-ink-400 text-xs mt-3">@{agent?.username ?? '—'}</Text>
            <Pressable onPress={() => setPicking(true)} className="mt-2">
              <Text className="text-brand-700 text-sm font-semibold">
                {avatarUri ? 'Change photo' : 'Upload photo'}
              </Text>
            </Pressable>
          </View>

          <View
            className="bg-white dark:bg-ink-800 rounded-2xl p-4 mb-4 border border-ink-200 dark:border-ink-700"
            style={{ elevation: 1 }}
          >
            <Text className="text-ink-900 dark:text-white text-base font-bold mb-3">Personal details</Text>
            <AppInput
              label="Full name"
              value={name}
              onChangeText={setName}
              placeholder="Your full name"
              icon="person-outline"
              error={errors.name}
            />
            <AppInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail-outline"
              error={errors.email}
            />
          </View>

          <View
            className="bg-white dark:bg-ink-800 rounded-2xl p-4 mb-4 border border-ink-200 dark:border-ink-700"
            style={{ elevation: 1 }}
          >
            <Text className="text-ink-900 dark:text-white text-base font-bold mb-1">Telephony</Text>
            <Text className="text-ink-500 dark:text-ink-400 text-xs mb-3">
              Used by the backend to bridge calls to your handset.
            </Text>
            <AppInput
              label="Extension"
              value={extension ?? ''}
              onChangeText={setExtension}
              placeholder="1001"
              keyboardType="number-pad"
              icon="call-outline"
            />
            <AppInput
              label="SIP username"
              value={sipUsername ?? ''}
              onChangeText={setSipUsername}
              placeholder="sip_1001"
              autoCapitalize="none"
              icon="server-outline"
            />
          </View>

          <AppButton
            label="Save changes"
            onPress={submit}
            loading={submitting}
            fullWidth
            size="lg"
            icon="save-outline"
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomSheet visible={picking} onClose={() => setPicking(false)} title="Profile photo">
        <PickerRow icon="camera-outline" label="Take photo" onPress={() => onPick('camera')} />
        <PickerRow icon="image-outline" label="Choose from gallery" onPress={() => onPick('library')} />
        {avatarUri ? (
          <PickerRow icon="trash-outline" label="Remove photo" onPress={removePhoto} danger />
        ) : null}
      </BottomSheet>
    </View>
  );
}

function PickerRow({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center p-3 mb-2 rounded-2xl border border-ink-200 dark:border-ink-700 active:bg-ink-50 dark:bg-ink-700"
    >
      <View className={`w-11 h-11 rounded-2xl items-center justify-center mr-3 ${danger ? 'bg-rose-50' : 'bg-brand-50'}`}>
        <Ionicons name={icon} size={20} color={danger ? '#EF4444' : '#444CE7'} />
      </View>
      <Text className={`flex-1 font-semibold ${danger ? 'text-rose-700' : 'text-ink-900 dark:text-white'}`}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
    </Pressable>
  );
}
