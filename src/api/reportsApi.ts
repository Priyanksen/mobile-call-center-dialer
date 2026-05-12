import { axiosClient } from './axiosClient';
import { endpoints } from './endpoints';
import {
  CampaignReport,
  DayBucket,
  DispositionBucket,
  DispositionKey,
  FullReport,
  ReportRange,
  RouteBucket,
} from '@/types/report';
import { mockCalls, mockCampaigns, shouldUseMock } from './_mock';

function rangeDates(range: ReportRange): { from: Date; to: Date } {
  const now = new Date();
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);
  const from = new Date(now);
  from.setHours(0, 0, 0, 0);
  if (range === 'yesterday') {
    from.setDate(from.getDate() - 1);
    to.setDate(to.getDate() - 1);
  } else if (range === 'last7') {
    from.setDate(from.getDate() - 6);
  }
  return { from, to };
}

function fmtDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function buildMockReport(range: ReportRange): FullReport {
  const { from, to } = rangeDates(range);
  const calls = mockCalls.filter((c) => {
    if (!c.started_at) return false;
    const t = new Date(c.started_at).getTime();
    return t >= from.getTime() && t <= to.getTime();
  });
  // If the seeded mock has nothing in range, synthesize a believable set so the
  // dev UI is never empty.
  const useSynthetic = calls.length === 0;
  const days: DayBucket[] = [];
  const cursor = new Date(from);
  while (cursor.getTime() <= to.getTime()) {
    const dayKey = fmtDay(cursor);
    if (useSynthetic) {
      const total = Math.round(20 + Math.random() * 30);
      days.push({
        date: dayKey,
        total,
        connected: Math.round(total * (0.55 + Math.random() * 0.25)),
      });
    } else {
      const dayCalls = calls.filter((c) => fmtDay(new Date(c.started_at!)) === dayKey);
      days.push({
        date: dayKey,
        total: dayCalls.length,
        connected: dayCalls.filter((c) => c.status === 'completed' || c.status === 'connected').length,
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  const total = days.reduce((a, b) => a + b.total, 0);
  const connected = days.reduce((a, b) => a + b.connected, 0);
  const missed = Math.max(0, Math.round(total * 0.18));
  const callbacks = Math.round(total * 0.1);
  const conversions = Math.round(connected * 0.12);
  const avgDuration = Math.round(180 + Math.random() * 90);

  const dispositions: DispositionKey[] = [
    'interested',
    'not_interested',
    'callback',
    'no_answer',
    'busy',
    'wrong_number',
    'converted',
    'closed',
  ];
  const dispWeights = [0.22, 0.18, 0.12, 0.16, 0.06, 0.05, 0.09, 0.12];
  const by_disposition: DispositionBucket[] = dispositions.map((s, i) => ({
    status: s,
    count: Math.round(total * dispWeights[i]),
  }));

  const routeWeights: { route: RouteBucket['route']; w: number }[] = [
    { route: 'sip', w: 0.55 },
    { route: 'sim', w: 0.3 },
    { route: 'voip', w: 0.15 },
  ];
  const by_route: RouteBucket[] = routeWeights.map((r) => ({
    route: r.route,
    count: Math.round(total * r.w),
  }));

  const by_campaign: CampaignReport[] = mockCampaigns.map((c, i) => {
    const share = i === 0 ? 0.6 : 0.4 / Math.max(1, mockCampaigns.length - 1);
    const t = Math.round(total * share);
    const conn = Math.round(t * 0.62);
    const conv = Math.round(conn * 0.18);
    return {
      campaign_id: c.id,
      campaign_name: c.name,
      total: t,
      connected: conn,
      conversions: conv,
      conversion_rate: conn ? Math.round((conv / conn) * 100) : 0,
    };
  });

  return {
    summary: {
      total_calls: total,
      connected_calls: connected,
      missed_calls: missed,
      callbacks,
      conversions,
      avg_duration: avgDuration,
      connect_rate: total ? Math.round((connected / total) * 100) : 0,
    },
    by_day: days,
    by_disposition,
    by_route,
    by_campaign,
  };
}

export const reportsApi = {
  async full(range: ReportRange): Promise<FullReport> {
    try {
      const { from, to } = rangeDates(range);
      const { data } = await axiosClient.get<FullReport>(endpoints.reports.full, {
        params: { date_from: fmtDay(from), date_to: fmtDay(to) },
      });
      return data;
    } catch (e) {
      if (shouldUseMock(e)) return buildMockReport(range);
      throw e;
    }
  },
};
