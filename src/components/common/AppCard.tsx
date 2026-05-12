import React, { ReactNode } from 'react';
import { Pressable, View, ViewProps } from 'react-native';

interface Props extends ViewProps {
  children: ReactNode;
  onPress?: () => void;
  padded?: boolean;
  flat?: boolean;
}

export function AppCard({
  children,
  onPress,
  padded = true,
  flat,
  className,
  ...rest
}: Props & { className?: string }) {
  const shadow = flat
    ? ''
    : 'shadow-sm';
  const base = `bg-white dark:bg-ink-800 rounded-2xl border border-ink-200 dark:border-ink-700 ${padded ? 'p-4' : ''} ${shadow} ${className ?? ''}`;
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className={`${base} active:opacity-80`}
        style={!flat ? { elevation: 1 } : undefined}
        {...rest}
      >
        {children}
      </Pressable>
    );
  }
  return (
    <View className={base} style={!flat ? { elevation: 1 } : undefined} {...rest}>
      {children}
    </View>
  );
}
