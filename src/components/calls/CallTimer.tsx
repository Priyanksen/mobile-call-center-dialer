import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { CallStatus } from '@/types/call';
import { formatDuration } from '@/utils/formatDuration';

interface Props {
  status: CallStatus | null;
  syncedDuration?: number;
}

const TICKING: CallStatus[] = ['answered', 'connected'];

export function CallTimer({ status, syncedDuration = 0 }: Props) {
  const [seconds, setSeconds] = useState(syncedDuration);

  useEffect(() => {
    setSeconds(syncedDuration);
  }, [syncedDuration]);

  useEffect(() => {
    if (!status || !TICKING.includes(status)) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  return <Text className="text-white text-4xl font-light tracking-widest">{formatDuration(seconds)}</Text>;
}
