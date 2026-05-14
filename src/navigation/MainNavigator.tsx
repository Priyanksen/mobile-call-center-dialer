import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from './types';
import { AgentDashboardScreen } from '@/screens/dashboard/AgentDashboardScreen';
import { LeadListScreen } from '@/screens/leads/LeadListScreen';
import { CallbackListScreen } from '@/screens/callbacks/CallbackListScreen';
import { CallHistoryScreen } from '@/screens/calls/CallHistoryScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

type IconName = keyof typeof Ionicons.glyphMap;

const tabIcons: Record<keyof MainTabParamList, { active: IconName; inactive: IconName }> = {
  Dashboard: { active: 'home', inactive: 'home-outline' },
  Leads: { active: 'people', inactive: 'people-outline' },
  Callbacks: { active: 'time', inactive: 'time-outline' },
  History: { active: 'receipt', inactive: 'receipt-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

export function MainNavigator() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 0);
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#6172F3',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarItemStyle: { paddingVertical: 6 },
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          height: 60 + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 6,
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowOffset: { width: 0, height: -4 },
          shadowRadius: 12,
        },
        tabBarIcon: ({ focused, color }) => {
          const set = tabIcons[route.name as keyof MainTabParamList];
          return <Ionicons name={focused ? set.active : set.inactive} size={22} color={color} />;
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={AgentDashboardScreen} />
      <Tab.Screen name="Leads" component={LeadListScreen} />
      <Tab.Screen name="Callbacks" component={CallbackListScreen} options={{ tabBarLabel: 'Follow-ups' }} />
      <Tab.Screen name="History" component={CallHistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
