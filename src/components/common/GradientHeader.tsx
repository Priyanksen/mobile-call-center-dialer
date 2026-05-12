import React, { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';

interface Props {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onBack?: () => void;
  hideBack?: boolean;
}

export function GradientHeader({ title, subtitle, right, onBack, hideBack }: Props) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const goBack =
    onBack ??
    (() => {
      if (navigation.canGoBack()) navigation.goBack();
      else navigation.navigate('Main', { screen: 'Dashboard' } as never);
    });

  return (
    <View
      style={{
        paddingTop: insets.top + 12,
        paddingHorizontal: 16,
        paddingBottom: 18,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        overflow: 'hidden',
      }}
    >
      <LinearGradient
        colors={['#3538CD', '#6172F3']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <View className="flex-row items-center">
        {!hideBack ? (
          <Pressable
            onPress={goBack}
            hitSlop={10}
            className="w-10 h-10 rounded-full bg-white/15 items-center justify-center mr-3"
          >
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </Pressable>
        ) : null}
        <View className="flex-1">
          <Text className="text-white text-2xl font-bold" numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text className="text-white/80 text-xs mt-0.5" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {right}
      </View>
    </View>
  );
}
