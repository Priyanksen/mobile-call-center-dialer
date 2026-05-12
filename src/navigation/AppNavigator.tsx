import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useAuthStore } from '@/store/authStore';
import { setAuthFailureHandler } from '@/api/axiosClient';

import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';

import { LeadDetailScreen } from '@/screens/leads/LeadDetailScreen';
import { CallScreen } from '@/screens/calls/CallScreen';
import { DispositionScreen } from '@/screens/calls/DispositionScreen';
import { ScheduleCallbackScreen } from '@/screens/callbacks/ScheduleCallbackScreen';
import { CampaignListScreen } from '@/screens/campaigns/CampaignListScreen';
import { CampaignDetailScreen } from '@/screens/campaigns/CampaignDetailScreen';
import { NotificationsScreen } from '@/screens/notifications/NotificationsScreen';
import { SettingsScreen } from '@/screens/profile/SettingsScreen';
import { EditProfileScreen } from '@/screens/profile/EditProfileScreen';
import { HelpSupportScreen } from '@/screens/profile/HelpSupportScreen';
import { TermsPrivacyScreen } from '@/screens/profile/TermsPrivacyScreen';
import { ReportsScreen } from '@/screens/reports/ReportsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

function BootSplash() {
  return (
    <View className="flex-1 items-center justify-center bg-ink-900">
      <ActivityIndicator color="#fff" size="large" />
    </View>
  );
}

export function AppNavigator() {
  const status = useAuthStore((s) => s.status);
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const setUnauth = useAuthStore((s) => s.setUnauthenticated);

  useEffect(() => {
    void bootstrap();
    setAuthFailureHandler(() => setUnauth());
    return () => setAuthFailureHandler(null);
  }, [bootstrap, setUnauth]);

  if (status === 'loading') return <BootSplash />;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#0B1220',
          headerTitleStyle: { fontWeight: '700' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: '#F4F6FB' },
        }}
      >
        {status === 'unauthenticated' ? (
          <Stack.Screen name="Auth" component={AuthNavigator} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainNavigator} options={{ headerShown: false }} />
            <Stack.Screen name="LeadDetail" component={LeadDetailScreen} options={{ headerShown: false }} />
            <Stack.Screen
              name="Call"
              component={CallScreen}
              options={{ headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen name="Disposition" component={DispositionScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ScheduleCallback" component={ScheduleCallbackScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CampaignList" component={CampaignListScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CampaignDetail" component={CampaignDetailScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
            <Stack.Screen name="HelpSupport" component={HelpSupportScreen} options={{ headerShown: false }} />
            <Stack.Screen name="TermsPrivacy" component={TermsPrivacyScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Reports" component={ReportsScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
