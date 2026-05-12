export type AgentStatus = 'available' | 'busy' | 'break' | 'offline';

export interface Agent {
  id: number;
  name: string;
  email: string;
  username: string;
  extension?: string | null;
  sip_username?: string | null;
  avatar_url?: string | null;
  status: AgentStatus;
  campaign_ids?: number[];
}

export interface AgentStats {
  total_calls: number;
  connected_calls: number;
  missed_calls: number;
  callbacks_due: number;
  conversions: number;
}
