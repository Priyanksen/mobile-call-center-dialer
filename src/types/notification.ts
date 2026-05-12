export interface AppNotification {
  id: number;
  title: string;
  body: string;
  type: 'callback' | 'lead' | 'system' | 'campaign';
  is_read: boolean;
  created_at: string;
  data?: Record<string, unknown>;
}
