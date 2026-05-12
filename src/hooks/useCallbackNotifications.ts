import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Callback } from '@/types/callback';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

let channelReady = false;

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android' || channelReady) return;
  try {
    await Notifications.setNotificationChannelAsync('callbacks', {
      name: 'Callback reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#444CE7',
    });
    channelReady = true;
  } catch {
    // ignore — channel may already exist or not be supported
  }
}

export async function ensureNotificationPermission(): Promise<boolean> {
  try {
    const settings = await Notifications.getPermissionsAsync();
    if (settings.granted) return true;
    const req = await Notifications.requestPermissionsAsync();
    return req.granted;
  } catch {
    return false;
  }
}

export async function scheduleCallbackReminder(cb: Callback): Promise<string | null> {
  const date = new Date(cb.scheduled_at);
  if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) return null;
  const ok = await ensureNotificationPermission();
  if (!ok) return null;
  await ensureAndroidChannel();
  try {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: `Callback: ${cb.customer_name ?? 'Lead'}`,
        body: cb.notes ?? `Call ${cb.phone ?? ''}`,
        data: { callback_id: cb.id, lead_id: cb.lead_id },
        ...(Platform.OS === 'android' ? { channelId: 'callbacks' } : {}),
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
    });
  } catch {
    return null;
  }
}

export function useCallbackNotifications(callbacks: Callback[]) {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await ensureNotificationPermission();
      if (!ok || cancelled) return;
      await ensureAndroidChannel();
      try {
        await Notifications.cancelAllScheduledNotificationsAsync();
      } catch {
        // ignore
      }
      for (const cb of callbacks) {
        if (cancelled) return;
        if (cb.status === 'pending') {
          await scheduleCallbackReminder(cb);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [callbacks]);
}
