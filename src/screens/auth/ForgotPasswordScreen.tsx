import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GradientHeader } from '@/components/common/GradientHeader';
import { AppButton } from '@/components/common/AppButton';
import { AuthStackParamList } from '@/navigation/types';
import { isEmail, isNonEmpty } from '@/utils/validators';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

const RESEND_SECONDS = 30;

export function ForgotPasswordScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const submit = async () => {
    setError(null);
    if (!isNonEmpty(email)) {
      setError('Please enter your email or username.');
      return;
    }
    if (email.includes('@') && !isEmail(email)) {
      setError('That email looks malformed.');
      return;
    }
    setSubmitting(true);
    try {
      // Backend endpoint placeholder — would call POST /api/auth/password/reset/
      await new Promise((res) => setTimeout(res, 800));
      setSent(true);
      setCooldown(RESEND_SECONDS);
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    if (cooldown > 0) return;
    setSubmitting(true);
    await new Promise((res) => setTimeout(res, 500));
    setSubmitting(false);
    setCooldown(RESEND_SECONDS);
  };

  return (
    <View className="flex-1 bg-bg dark:bg-ink-900">
      <GradientHeader title="Forgot password" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Illustration */}
          <View className="items-center my-6">
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 28,
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                shadowColor: '#444CE7',
                shadowOpacity: 0.25,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 10 },
                elevation: 10,
              }}
            >
              <LinearGradient
                colors={['#8098F9', '#444CE7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
              />
              <Ionicons name={sent ? 'mail-open-outline' : 'key-outline'} size={42} color="#fff" />
            </View>
          </View>

          {!sent ? (
            <>
              <Text className="text-ink-900 dark:text-white text-2xl font-bold text-center">
                Reset your password
              </Text>
              <Text className="text-ink-500 dark:text-ink-400 text-center mt-2 mb-6 leading-5 px-2">
                Enter the email associated with your agent account and we'll send you a secure reset link.
              </Text>

              <View
                className="bg-white dark:bg-ink-800 rounded-3xl p-5 mb-4"
                style={{
                  elevation: 6,
                  shadowColor: '#000',
                  shadowOpacity: 0.08,
                  shadowRadius: 18,
                  shadowOffset: { width: 0, height: 6 },
                  borderWidth: 1,
                  borderColor: 'rgba(0,0,0,0.04)',
                }}
              >
                <Text className="text-[11px] text-ink-600 dark:text-ink-300 mb-1.5 font-bold uppercase tracking-wider">
                  Email address
                </Text>
                <View
                  style={{
                    backgroundColor: focused ? '#EEF4FF' : '#F8FAFC',
                    borderRadius: 14,
                    paddingHorizontal: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1.5,
                    borderColor: error ? '#F43F5E' : focused ? '#6172F3' : 'transparent',
                  }}
                  className="dark:bg-ink-700"
                >
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color={focused ? '#444CE7' : '#94A3B8'}
                    style={{ marginRight: 10 }}
                  />
                  <TextInput
                    value={email}
                    onChangeText={(v) => {
                      setEmail(v);
                      if (error) setError(null);
                    }}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    placeholder="agent@bol7.com"
                    placeholderTextColor="#94A3B8"
                    style={{ flex: 1, paddingVertical: 13, color: '#0B1220', fontSize: 15 }}
                    className="dark:text-white"
                  />
                </View>
                {error ? (
                  <View className="flex-row items-center mt-2">
                    <Ionicons name="alert-circle" size={14} color="#E11D48" />
                    <Text className="text-rose-700 text-xs ml-1.5">{error}</Text>
                  </View>
                ) : null}

                <View className="h-4" />

                <Pressable
                  onPress={submit}
                  disabled={submitting}
                  style={({ pressed }) => ({
                    borderRadius: 14,
                    overflow: 'hidden',
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                    opacity: submitting ? 0.85 : 1,
                    shadowColor: '#444CE7',
                    shadowOpacity: pressed ? 0.5 : 0.35,
                    shadowRadius: pressed ? 18 : 14,
                    shadowOffset: { width: 0, height: pressed ? 8 : 6 },
                    elevation: pressed ? 8 : 6,
                  })}
                >
                  {({ pressed }) => (
                    <LinearGradient
                      colors={pressed ? ['#3538CD', '#2D31A6'] : ['#6172F3', '#3538CD']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        paddingVertical: 15,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                      }}
                    >
                      <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15, marginRight: 8 }}>
                        {submitting ? 'Sending…' : 'Send reset link'}
                      </Text>
                      <Ionicons
                        name={submitting ? 'hourglass-outline' : 'paper-plane-outline'}
                        size={18}
                        color="#fff"
                      />
                    </LinearGradient>
                  )}
                </Pressable>
              </View>

              {/* Info chip */}
              <View
                className="rounded-2xl p-3 flex-row items-start mb-4"
                style={{ backgroundColor: 'rgba(68,76,231,0.06)', borderWidth: 1, borderColor: 'rgba(68,76,231,0.18)' }}
              >
                <View className="w-7 h-7 rounded-lg bg-brand-50 items-center justify-center mr-2 mt-0.5">
                  <Ionicons name="information-circle-outline" size={16} color="#444CE7" />
                </View>
                <View className="flex-1">
                  <Text className="text-ink-900 dark:text-white text-sm font-semibold mb-0.5">
                    Don't see the email?
                  </Text>
                  <Text className="text-ink-500 dark:text-ink-400 text-xs leading-4">
                    It may take a minute or two. Also check your spam folder.
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <>
              <Text className="text-ink-900 dark:text-white text-2xl font-bold text-center">
                Check your email
              </Text>
              <Text className="text-ink-500 dark:text-ink-400 text-center mt-2 mb-6 leading-5 px-2">
                We sent a password reset link to{' '}
                <Text className="text-ink-900 dark:text-white font-semibold">{email}</Text>.{' '}
                Follow the link in the email to choose a new password.
              </Text>

              <View
                className="bg-white dark:bg-ink-800 rounded-3xl p-5 mb-4"
                style={{
                  elevation: 6,
                  shadowColor: '#000',
                  shadowOpacity: 0.08,
                  shadowRadius: 18,
                  shadowOffset: { width: 0, height: 6 },
                  borderWidth: 1,
                  borderColor: 'rgba(0,0,0,0.04)',
                }}
              >
                <View
                  className="flex-row items-center rounded-xl p-3 mb-3"
                  style={{ backgroundColor: 'rgba(16,185,129,0.08)' }}
                >
                  <View className="w-9 h-9 rounded-xl bg-emerald-100 items-center justify-center mr-3">
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-emerald-700 font-semibold text-sm">Email sent</Text>
                    <Text className="text-ink-500 dark:text-ink-400 text-xs mt-0.5">
                      The link is valid for 30 minutes.
                    </Text>
                  </View>
                </View>

                <AppButton
                  label={cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend email'}
                  onPress={resend}
                  loading={submitting}
                  disabled={cooldown > 0 || submitting}
                  variant="ghost"
                  fullWidth
                  icon="refresh-outline"
                />
                <View className="h-2" />
                <Pressable
                  onPress={() => {
                    setSent(false);
                    setEmail('');
                  }}
                  className="self-center py-2"
                >
                  <Text className="text-brand-600 font-semibold text-sm">Use a different email</Text>
                </Pressable>
              </View>
            </>
          )}

          {/* Back to sign in */}
          <Pressable
            onPress={() => navigation.goBack()}
            className="flex-row items-center justify-center py-2 mt-2"
          >
            <Ionicons name="arrow-back" size={16} color="#444CE7" />
            <Text className="text-brand-600 font-semibold text-sm ml-1.5">Back to sign in</Text>
          </Pressable>

          <View style={{ flex: 1 }} />

          <View className="flex-row items-center justify-center mt-6">
            <Ionicons name="shield-checkmark-outline" size={13} color="#94A3B8" />
            <Text className="text-ink-400 dark:text-ink-500 text-[11px] ml-1.5">
              Reset links are single-use and expire in 30 min
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
