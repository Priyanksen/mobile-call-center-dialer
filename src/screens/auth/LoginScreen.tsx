import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuthStore } from '@/store/authStore';
import { AuthStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

function FloatingOrb({
  delay,
  size,
  color,
  top,
  left,
  right,
  bottom,
}: {
  delay: number;
  size: number;
  color: string;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, { toValue: 1, duration: 4500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 4500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v, delay]);
  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [0, 18] });
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: 0.55,
        top,
        left,
        right,
        bottom,
        transform: [{ translateY }],
      }}
    />
  );
}

export function LoginScreen({ navigation }: Props) {
  const login = useAuthStore((s) => s.login);
  const error = useAuthStore((s) => s.error);
  const insets = useSafeAreaInsets();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);
  const [focusedField, setFocusedField] = useState<'username' | 'password' | null>(null);

  const onSubmit = async () => {
    setLocalError(null);
    if (!username.trim() || !password.trim()) {
      setLocalError('Please enter both username and password.');
      return;
    }
    setSubmitting(true);
    try {
      await login(username.trim(), password);
    } catch {
      // store sets error
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F8FE' }}>
      {/* Soft pastel orbs floating in the background */}
      <FloatingOrb delay={0} size={220} color="#C7D2FE" top={-60} right={-50} />
      <FloatingOrb delay={1500} size={180} color="#FBCFE8" top={120} left={-60} />
      <FloatingOrb delay={3000} size={140} color="#BAE6FD" top={260} right={-30} />
      <FloatingOrb delay={500} size={160} color="#DDD6FE" bottom={120} left={-40} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: insets.top + 40,
            paddingBottom: insets.bottom + 24,
            paddingHorizontal: 24,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand mark */}
          <View style={{ alignItems: 'center', marginBottom: 28 }}>
            <View
              style={{
                width: 76,
                height: 76,
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                overflow: 'hidden',
                shadowColor: '#444CE7',
                shadowOpacity: 0.3,
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
              <Ionicons name="call" size={34} color="#fff" />
            </View>

            <Text className="text-ink-900 text-3xl font-bold tracking-tight">Agent Dialer</Text>
            <Text className="text-ink-500 mt-1.5 text-sm">Outbound calling, simplified.</Text>

            <View
              className="flex-row items-center mt-4 px-3 py-1.5 rounded-full"
              style={{ backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' }}
            >
              <View
                style={{ width: 6, height: 6, borderRadius: 3, marginRight: 6, backgroundColor: '#10B981' }}
              />
              <Text style={{ color: '#047857' }} className="text-[10px] font-bold uppercase tracking-widest">
                Service online
              </Text>
            </View>
          </View>

          {/* Form card */}
          <View
            className="bg-white rounded-3xl p-6"
            style={{
              elevation: 8,
              shadowColor: '#444CE7',
              shadowOpacity: 0.1,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: 12 },
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.8)',
            }}
          >
            <Text className="text-ink-900 text-2xl font-bold mb-1">Welcome back</Text>
            <Text className="text-ink-500 text-sm mb-5">Sign in to start your shift.</Text>

            {/* Username */}
            <Text className="text-[11px] text-ink-600 mb-1.5 font-bold uppercase tracking-wider">
              Username or email
            </Text>
            <View
              style={{
                backgroundColor: focusedField === 'username' ? '#EEF4FF' : '#F8FAFC',
                borderRadius: 14,
                paddingHorizontal: 14,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1.5,
                borderColor: focusedField === 'username' ? '#6172F3' : 'transparent',
                marginBottom: 14,
              }}
            >
              <Ionicons
                name="person-outline"
                size={18}
                color={focusedField === 'username' ? '#444CE7' : '#94A3B8'}
                style={{ marginRight: 10 }}
              />
              <TextInput
                value={username}
                onChangeText={setUsername}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                placeholder="agent@bol7.com"
                placeholderTextColor="#94A3B8"
                style={{ flex: 1, paddingVertical: 13, color: '#0B1220', fontSize: 15 }}
              />
            </View>

            {/* Password */}
            <View className="flex-row items-center justify-between mb-1.5">
              <Text className="text-[11px] text-ink-600 font-bold uppercase tracking-wider">Password</Text>
              <Pressable onPress={() => navigation.navigate('ForgotPassword')} hitSlop={6}>
                <Text className="text-brand-600 text-xs font-semibold">Forgot?</Text>
              </Pressable>
            </View>
            <View
              style={{
                backgroundColor: focusedField === 'password' ? '#EEF4FF' : '#F8FAFC',
                borderRadius: 14,
                paddingHorizontal: 14,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1.5,
                borderColor: focusedField === 'password' ? '#6172F3' : 'transparent',
                marginBottom: 14,
              }}
            >
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={focusedField === 'password' ? '#444CE7' : '#94A3B8'}
                style={{ marginRight: 10 }}
              />
              <TextInput
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                secureTextEntry={!showPwd}
                autoCapitalize="none"
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                style={{ flex: 1, paddingVertical: 13, color: '#0B1220', fontSize: 15 }}
              />
              <Pressable onPress={() => setShowPwd((s) => !s)} hitSlop={8}>
                <Ionicons
                  name={showPwd ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#64748B"
                />
              </Pressable>
            </View>

            {(localError || error) && (
              <View
                style={{
                  backgroundColor: '#FEF2F2',
                  borderColor: '#FECACA',
                  borderWidth: 1,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  marginBottom: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="alert-circle" size={16} color="#E11D48" />
                <Text style={{ color: '#B91C1C', fontSize: 13, marginLeft: 8, flex: 1 }}>
                  {localError ?? error}
                </Text>
              </View>
            )}

            {/* Gradient Sign in button */}
            <Pressable
              onPress={onSubmit}
              disabled={submitting}
              android_ripple={{ color: 'rgba(255,255,255,0.15)', borderless: false }}
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
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15, marginRight: 8, letterSpacing: 0.3 }}>
                    {submitting ? 'Signing in…' : 'Sign in'}
                  </Text>
                  <Ionicons
                    name={submitting ? 'hourglass-outline' : 'arrow-forward'}
                    size={18}
                    color="#fff"
                  />
                </LinearGradient>
              )}
            </Pressable>

            <View className="flex-row items-center justify-center mt-4">
              <Ionicons name="shield-checkmark-outline" size={13} color="#94A3B8" />
              <Text className="text-ink-400 text-[11px] ml-1.5">
                Secure connection · JWT protected
              </Text>
            </View>
          </View>

          <Text className="text-center text-ink-400 text-[11px] mt-6">
            Agent Dialer v1.0.0 · Powered by bol7
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
