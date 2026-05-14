import { ENV } from '@/config/env';
import { Lead } from '@/types/lead';
import { Campaign } from '@/types/campaign';
import { Callback } from '@/types/callback';
import { Call } from '@/types/call';
import { AppNotification } from '@/types/notification';
import { Agent, AgentStats } from '@/types/agent';

export function shouldUseMock(error: unknown): boolean {
  if (!ENV.USE_MOCK_FALLBACK) return false;
  const e = error as { message?: string; code?: string; response?: { status?: number } };
  if (e?.response?.status && e.response.status < 500) return false;
  return true;
}

export const mockAgent: Agent = {
  id: 1,
  name: 'Demo Agent',
  email: 'agent@bol7.com',
  username: 'demo_agent',
  extension: '1001',
  sip_username: 'sip_1001',
  avatar_url: null,
  status: 'available',
};

export const mockStats: AgentStats = {
  total_calls: 42,
  connected_calls: 28,
  missed_calls: 6,
  callbacks_due: 4,
  conversions: 7,
  new_leads: 5,
};

export const mockCampaigns: Campaign[] = [
  {
    id: 1,
    name: 'Insurance Renewals — Q2',
    campaign_type: 'outbound',
    calling_route: 'sip',
    total_leads: 120,
    completed_leads: 60,
    pending_leads: 60,
    connected_calls: 41,
    conversion_rate: 18,
    is_active: true,
  },
  {
    id: 2,
    name: 'Loan Promo — North',
    campaign_type: 'outbound',
    calling_route: 'sim',
    total_leads: 80,
    completed_leads: 22,
    pending_leads: 58,
    connected_calls: 19,
    conversion_rate: 9,
    is_active: true,
  },
];

export const mockLeads: Lead[] = [
  {
    id: 101,
    name: 'Rahul Sharma',
    phone: '+919812345678',
    email: 'rahul@example.com',
    campaign_id: 1,
    campaign_name: 'Insurance Renewals — Q2',
    status: 'new',
    priority: 'high',
    last_called_at: null,
    next_callback_at: null,
    city: 'Delhi',
  },
  {
    id: 102,
    name: 'Priya Verma',
    phone: '+919898989898',
    email: null,
    campaign_id: 1,
    campaign_name: 'Insurance Renewals — Q2',
    status: 'callback',
    priority: 'urgent',
    last_called_at: '2026-05-10T08:30:00Z',
    next_callback_at: '2026-05-12T10:00:00Z',
    city: 'Mumbai',
  },
  {
    id: 103,
    name: 'Amit Singh',
    phone: '+919777777777',
    campaign_id: 2,
    campaign_name: 'Loan Promo — North',
    status: 'contacted',
    priority: 'medium',
    last_called_at: '2026-05-09T11:00:00Z',
    next_callback_at: null,
    city: 'Lucknow',
  },
];

export const mockCallbacks: Callback[] = [
  {
    id: 9001,
    lead_id: 102,
    scheduled_at: '2026-05-12T10:00:00Z',
    notes: 'Wants quotes for family floater plan.',
    status: 'pending',
    customer_name: 'Priya Verma',
    phone: '+919898989898',
  },
  {
    id: 9002,
    lead_id: 103,
    scheduled_at: '2026-05-11T18:30:00Z',
    notes: 'Send brochure first.',
    status: 'pending',
    customer_name: 'Amit Singh',
    phone: '+919777777777',
  },
];

export const mockCalls: Call[] = [
  {
    call_id: 'CALL-0001',
    lead_id: 102,
    phone: '+919898989898',
    route_type: 'sip',
    status: 'completed',
    started_at: '2026-05-10T08:30:00Z',
    ended_at: '2026-05-10T08:34:21Z',
    duration: 261,
    disposition: 'callback',
    notes: 'Reschedule for Tuesday.',
    recording_url: null,
    campaign_name: 'Insurance Renewals — Q2',
    customer_name: 'Priya Verma',
  },
];

export const mockNotifications: AppNotification[] = [
  {
    id: 1,
    title: 'Callback due soon',
    body: 'Priya Verma at 10:00 AM',
    type: 'callback',
    is_read: false,
    created_at: '2026-05-11T08:00:00Z',
  },
];
