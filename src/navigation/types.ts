import { NavigatorScreenParams } from '@react-navigation/native';
import { Lead } from '@/types/lead';

export type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Leads: undefined;
  Callbacks: undefined;
  History: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;

  EditProfile: undefined;
  HelpSupport: undefined;
  TermsPrivacy: undefined;
  Reports: undefined;
  LeadDetail: { leadId: number };
  Call: { callId: string; lead: Lead; routeType: 'sip' | 'sim' | 'voip' };
  Disposition: { callId: string; lead: Lead };
  ScheduleCallback: { lead: Lead };
  CampaignList: undefined;
  CampaignDetail: { campaignId: number };
  Notifications: undefined;
  Settings: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
