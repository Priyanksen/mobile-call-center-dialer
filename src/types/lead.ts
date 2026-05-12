export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'interested'
  | 'not_interested'
  | 'callback'
  | 'converted'
  | 'closed';

export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Lead {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  campaign_id?: number | null;
  campaign_name?: string | null;
  status: LeadStatus;
  priority: LeadPriority;
  last_called_at?: string | null;
  next_callback_at?: string | null;
  notes?: string | null;
  city?: string | null;
}

export interface LeadFilters {
  search?: string;
  status?: LeadStatus | 'all';
  campaign_id?: number | 'all';
  ordering?: 'priority' | '-created_at' | 'next_callback_at';
}
