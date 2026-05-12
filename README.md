# Dialer Mobile (Agent App)

React Native + Expo + TypeScript frontend for the call-center agent app.
The app talks to the Django REST Framework backend; it does **not** run a SIP/WebRTC
stack itself in this version. All call control is done through backend APIs that
in turn drive Asterisk / SIP / GSM gateway.

## Stack

- React Native (Expo SDK 51)
- TypeScript
- React Navigation (Stack + Bottom Tabs)
- Axios (with JWT auto-refresh interceptor)
- Zustand for global state
- AsyncStorage + Expo SecureStore for token storage
- NativeWind (Tailwind for React Native)
- Expo Notifications for callback reminders

## Project layout

```
dialer-mobile/
├── App.tsx
├── index.js
├── app.json
├── babel.config.js
├── tailwind.config.js
├── tsconfig.json
└── src/
    ├── api/           # axios client, endpoints, per-resource APIs, mock fallback
    ├── config/        # env / runtime config
    ├── navigation/    # AppNavigator, AuthNavigator, MainNavigator, types
    ├── store/         # zustand stores (auth, agent, call)
    ├── storage/       # SecureStore-backed token storage
    ├── hooks/         # useAuth, useAgentStatus, useCallPolling, useCallbackNotifications, useDebounce
    ├── utils/         # formatDate, formatDuration, phone, validators
    ├── types/         # auth, agent, lead, call, callback, campaign, notification, api
    ├── components/    # common/, leads/, calls/, dashboard/
    └── screens/       # auth/, dashboard/, leads/, calls/, callbacks/, campaigns/, notifications/, profile/
```

## 1. Project setup (one-time)

If you want to recreate from scratch with the official Expo template:

```bash
npx create-expo-app@latest dialer-mobile --template blank-typescript
cd dialer-mobile
```

This repo already contains a complete project — `cd dialer-mobile` and skip to step 2.

## 2. Install dependencies

```bash
cd "Dialer App/dialer-mobile"
npx expo install \
  @react-native-async-storage/async-storage \
  expo-secure-store \
  expo-notifications \
  expo-constants \
  expo-status-bar \
  react-native-gesture-handler \
  react-native-safe-area-context \
  react-native-screens

npm install \
  axios \
  zustand \
  @react-navigation/native \
  @react-navigation/native-stack \
  @react-navigation/bottom-tabs \
  nativewind

npm install -D tailwindcss@3.3.2 typescript @types/react
```

> NativeWind v2 needs `tailwindcss@3.3.2`. Don't bump it.

## 3. Configure the backend URL

Edit [`app.json`](./app.json) → `expo.extra.API_BASE_URL`:

| Target                 | Value                          |
| ---------------------- | ------------------------------ |
| Android emulator       | `http://10.0.2.2:8000`         |
| iOS simulator          | `http://127.0.0.1:8000`        |
| Physical Android phone | `http://YOUR_LAN_IP:8000`      |
| Production             | `https://api.your-domain.com`  |

Find your LAN IP with `ip addr` (Linux) or `ifconfig` (mac). The phone and the
Django dev server must be on the same Wi-Fi network. Run Django bound to all
interfaces: `python manage.py runserver 0.0.0.0:8000`.

## 4. Run

```bash
# Android (default focus)
npx expo start --android

# Or generic
npx expo start
# then press 'a' for Android, 'i' for iOS
```

For physical devices: install **Expo Go** from the Play Store, scan the QR.

Type-check (no emit):

```bash
npm run tsc
```

## 5. How it talks to the backend

Auth flow:

1. `POST /api/auth/login/` returns `{ access, refresh }`.
2. Tokens stored via `tokenStorage` (Expo SecureStore on device, AsyncStorage on web).
3. The axios request interceptor attaches `Authorization: Bearer <access>`.
4. On `401`, the response interceptor calls `POST /api/auth/refresh/` with the
   refresh token, retries the original request, and falls back to logging out
   if refresh fails.

Call flow:

1. Agent taps **Call Now** in [`LeadDetailScreen`](src/screens/leads/LeadDetailScreen.tsx).
2. `POST /api/calls/initiate/` with `{ lead_id, phone, route_type }`.
3. Backend creates an Asterisk originate / SIP / GSM-gateway leg and returns
   `{ call_id, status }`.
4. The app navigates to [`CallScreen`](src/screens/calls/CallScreen.tsx) and
   begins polling `GET /api/calls/{call_id}/status/` every 2s
   (see [`useCallPolling`](src/hooks/useCallPolling.ts)).
5. Polling stops on terminal status (`completed | failed | busy | no_answer`).
6. On hangup, `POST /api/calls/hangup/`.
7. App routes to [`DispositionScreen`](src/screens/calls/DispositionScreen.tsx);
   `POST /api/calls/disposition/` writes the outcome, optional `callback_time`,
   and notes.

## 6. Mock fallback (development only)

When the backend is unreachable (network error or 5xx), read endpoints fall back
to in-memory mock data from [`src/api/_mock.ts`](src/api/_mock.ts). Toggle off
in production by setting `USE_MOCK_FALLBACK = false` in [`src/config/env.ts`](src/config/env.ts).
Write endpoints (login, initiate call, disposition, schedule callback) never use
mocks — they always hit the API.

## 7. Required backend endpoints

```
POST   /api/auth/login/
POST   /api/auth/refresh/
POST   /api/auth/logout/

GET    /api/agents/me/
PATCH  /api/agents/me/status/
GET    /api/agents/me/stats/

GET    /api/leads/
GET    /api/leads/next/
GET    /api/leads/{id}/
PATCH  /api/leads/{id}/

POST   /api/calls/initiate/
POST   /api/calls/hangup/
POST   /api/calls/disposition/
GET    /api/calls/
GET    /api/calls/{call_id}/
GET    /api/calls/{call_id}/status/

GET    /api/callbacks/
POST   /api/callbacks/
PATCH  /api/callbacks/{id}/

GET    /api/campaigns/
GET    /api/campaigns/{id}/

GET    /api/notifications/
PATCH  /api/notifications/{id}/read/
```

Expected payload shapes are documented in [`src/types/`](src/types/).

## 8. Notifications

The app uses `expo-notifications` for **local** callback reminders only. On first
load of the Callbacks tab the app requests permission, then schedules a local
notification for every pending callback's `scheduled_at`. Push notifications
(FCM/APNs) are not configured in this version.

## 9. Future SIP / WebRTC integration notes

When you're ready to do real telephony **inside** the app:

- **WebRTC / SIP softphone:** add `react-native-webrtc` and a SIP stack such as
  `sip.js` or `jssip`. You will need to eject from Expo Go to a custom dev
  client (`npx expo prebuild` + EAS build) since `react-native-webrtc` is not
  in Expo Go.
- **Native SIP SDK:** options include Linphone SDK and PJSIP wrappers. Same
  caveat — requires a custom dev client.
- **Twilio / Exotel:** their RN SDKs work in custom dev clients only.
- **Native dialer escape hatch:** for SIM calling without WebRTC, you can
  `Linking.openURL('tel:+91...')` to hand off to the OS dialer; the call leg
  itself is then outside your app.

In every case, keep `POST /api/calls/initiate/` as the single entry point — the
backend should remain the source of truth for `call_id`, status, and recording.
The mobile app can **either** poll status (current model) **or** subscribe to a
WebSocket once the backend exposes one.

## 10. Production checklist

- [ ] Set `USE_MOCK_FALLBACK = false` in `src/config/env.ts`
- [ ] Replace `app.json` `extra.API_BASE_URL` with the production HTTPS URL
- [ ] Configure FCM if you want server-pushed notifications
- [ ] Run `npx expo prebuild` and build with EAS for release
- [ ] Add a real app icon and splash to `assets/`
