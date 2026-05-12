import { Lead } from './lead';

export interface Callback {
  id: number;
  lead_id: number;
  lead?: Lead;
  scheduled_at: string;
  notes?: string | null;
  status: 'pending' | 'completed' | 'missed' | 'rescheduled';
  customer_name?: string;
  phone?: string;
}

export interface CreateCallbackRequest {
  lead_id: number;
  scheduled_at: string;
  notes?: string;
}
