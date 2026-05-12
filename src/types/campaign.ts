export type CampaignType = 'outbound' | 'inbound' | 'survey' | 'mixed';
export type CallingRoute = 'sip' | 'sim' | 'voip';

export interface Campaign {
  id: number;
  name: string;
  campaign_type: CampaignType;
  calling_route: CallingRoute;
  total_leads: number;
  completed_leads: number;
  pending_leads: number;
  connected_calls: number;
  conversion_rate: number;
  is_active?: boolean;
}
