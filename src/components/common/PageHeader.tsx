import React, { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '@/navigation/types';

interface Props {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  /**
   * Where the back button should land. Defaults to navigating to the Dashboard tab.
   * Pass `undefined` to hide it.
   */
  onBack?: () => void | null;
  hideBack?: boolean;
}

export function PageHeader({ title, subtitle, right, onBack, hideBack }: Props) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const goBack =
    onBack ??
    (() => navigation.navigate('Main', { screen: 'Dashboard' } as never));

  return (
    <View
      className="bg-white dark:bg-ink-800 border-b border-ink-100 dark:border-ink-700 px-4 pb-3"
      style={{ paddingTop: insets.top + 8 }}
    >
      <View className="flex-row items-center">
        {!hideBack ? (
          <Pressable
            onPress={goBack}
            hitSlop={10}
            className="w-9 h-9 rounded-full bg-ink-100 dark:bg-ink-700 items-center justify-center mr-3"
          >
            <Ionicons name="chevron-back" size={20} color="#94A3B8" />
          </Pressable>
        ) : null}
        <View className="flex-1">
          <Text className="text-ink-900 dark:text-white text-2xl font-bold">{title}</Text>
          {subtitle ? <Text className="text-ink-500 dark:text-ink-300 text-xs mt-0.5">{subtitle}</Text> : null}
        </View>
        {right}
      </View>
    </View>
  );
}
