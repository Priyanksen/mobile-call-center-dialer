import React, { ReactElement, ReactNode } from 'react';
import { RefreshControlProps, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  children: ReactNode;
  scroll?: boolean;
  refreshControl?: ReactElement<RefreshControlProps>;
  padded?: boolean;
  background?: 'default' | 'white';
}

export function ScreenContainer({
  children,
  scroll,
  refreshControl,
  padded = true,
  background = 'default',
}: Props) {
  const bg = background === 'white' ? 'bg-white dark:bg-ink-800' : 'bg-bg dark:bg-ink-900';
  const Inner = <View className={padded ? 'px-4 pt-4 pb-10' : ''}>{children}</View>;
  return (
    <SafeAreaView edges={['top']} className={`flex-1 ${bg}`}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl}
          showsVerticalScrollIndicator={false}
        >
          {Inner}
        </ScrollView>
      ) : (
        <View className="flex-1">{Inner}</View>
      )}
    </SafeAreaView>
  );
}
