import React, { ReactNode } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  visible: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
}

export function BottomSheet({ visible, title, onClose, children }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50" onPress={onClose}>
        <Pressable
          className="bg-white dark:bg-ink-800 rounded-t-3xl mt-auto p-5"
          style={{ paddingBottom: 24 + insets.bottom, elevation: 16 }}
          onPress={(e) => e.stopPropagation()}
        >
          <View className="w-12 h-1.5 bg-ink-200 rounded-full self-center mb-4" />
          {title ? (
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-ink-900 dark:text-white text-lg font-bold">{title}</Text>
              <Pressable onPress={onClose} hitSlop={10}>
                <Ionicons name="close" size={22} color="#64748B" />
              </Pressable>
            </View>
          ) : null}
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
