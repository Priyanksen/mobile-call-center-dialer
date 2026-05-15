export type ReportRange = 'today' | 'yesterday' | 'last7';

export interface ReportSummary {
  total_calls: number;
  connected_calls: number;
  missed_calls: number;
  callbacks: number;
  conversions: number;
  avg_duration: number; // seconds
  connect_rate: number; // 0..100
}

export interface DayBucket {
  date: string; // YYYY-MM-DD
  total: number;
  connected: number;
}

export type DispositionKey =
  | 'interested'
  | 'not_interested'
  | 'callback'
  | 'no_answer'
  | 'busy'
  | 'wrong_number'
  | 'converted'
  | 'closed';

export interface DispositionBucket {
  status: DispositionKey;
  count: number;
}

export interface RouteBucket {
  route: 'sip' | 'sim' | 'voip';
  count: number;
}

export interface CampaignReport {
  campaign_id: number;
  campaign_name: string;
  total: number;
  connected: number;
  conversions: number;
  conversion_rate: number; // 0..100
}

export interface NoteActivity {
  lead_id: number;
  lead_name: string;
  last_note: string;
  notes_count: number;
  updated_at: string; // ISO
}

export interface FullReport {
  summary: ReportSummary;
  by_day: DayBucket[];
  by_disposition: DispositionBucket[];
  by_route: RouteBucket[];
  by_campaign: CampaignReport[];
  notes_activity: NoteActivity[];
}
