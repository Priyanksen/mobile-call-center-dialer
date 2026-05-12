import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const ACCESS_KEY = 'auth.access';
const REFRESH_KEY = 'auth.refresh';

const useSecure = Platform.OS !== 'web';

async function setItem(key: string, value: string) {
  if (useSecure) await SecureStore.setItemAsync(key, value);
  else await AsyncStorage.setItem(key, value);
}

async function getItem(key: string): Promise<string | null> {
  if (useSecure) return SecureStore.getItemAsync(key);
  return AsyncStorage.getItem(key);
}

async function delItem(key: string) {
  if (useSecure) await SecureStore.deleteItemAsync(key);
  else await AsyncStorage.removeItem(key);
}

export const tokenStorage = {
  async setTokens(access: string, refresh: string) {
    await Promise.all([setItem(ACCESS_KEY, access), setItem(REFRESH_KEY, refresh)]);
  },
  async setAccess(access: string) {
    await setItem(ACCESS_KEY, access);
  },
  getAccess: () => getItem(ACCESS_KEY),
  getRefresh: () => getItem(REFRESH_KEY),
  async clear() {
    await Promise.all([delItem(ACCESS_KEY), delItem(REFRESH_KEY)]);
  },
};
