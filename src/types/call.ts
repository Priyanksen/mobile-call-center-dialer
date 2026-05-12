export type CallRouteType = 'sip' | 'sim' | 'voip';

export type CallStatus =
  | 'initiating'
  | 'ringing'
  | 'answered'
  | 'connected'
  | 'completed'
  | 'failed'
  | 'busy'
  | 'no_answer';

export type DispositionStatus =
  | 'interested'
  | 'not_interested'
  | 'callback'
  | 'no_answer'
  | 'busy'
  | 'wrong_number'
  | 'converted'
  | 'closed';

export interface CallInitiateRequest {
  lead_id: number;
  phone: string;
  route_type: CallRouteType;
}

export interface Call {
  call_id: string;
  lead_id: number;
  phone: string;
  route_type: CallRouteType;
  status: CallStatus;
  started_at?: string | null;
  ended_at?: string | null;
  duration?: number | null;
  disposition?: DispositionStatus | null;
  notes?: string | null;
  recording_url?: string | null;
  campaign_name?: string | null;
  customer_name?: string | null;
}

export interface DispositionRequest {
  call_id: string;
  lead_id: number;
  status: DispositionStatus;
  notes: string;
  callback_time: string | null;
}
