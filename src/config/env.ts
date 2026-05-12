import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string>;

export const ENV = {
  API_BASE_URL: extra.API_BASE_URL || 'http://10.0.2.2:8000',
  API_PREFIX: '/api',
  REQUEST_TIMEOUT_MS: 3500,
  CALL_POLL_INTERVAL_MS: 2000,
  USE_MOCK_FALLBACK: true,
  APP_VERSION: '1.0.0',
};

export const apiUrl = (path: string) =>
  `${ENV.API_BASE_URL}${ENV.API_PREFIX}${path.startsWith('/') ? path : `/${path}`}`;
