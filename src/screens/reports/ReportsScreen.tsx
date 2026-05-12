import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GradientHeader } from '@/components/common/GradientHeader';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { FilterChip } from '@/components/common/FilterChip';
import { reportsApi } from '@/api/reportsApi';
import { FullReport, ReportRange, DispositionKey } from '@/types/report';
import { formatDuration } from '@/utils/formatDuration';
import { exportReport, ExportFormat } from '@/utils/reportExport';
import { BottomSheet } from '@/components/common/BottomSheet';

const RANGES: { label: string; value: ReportRange }[] = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 days', value: 'last7' },
];

const DISPO_META: Record<
  DispositionKey,
  { label: string; color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  interested: { label: 'Interested', color: '#10B981', bg: 'bg-emerald-50', icon: 'thumbs-up-outline' },
  not_interested: { label: 'Not interested', color: '#EF4444', bg: 'bg-rose-50', icon: 'thumbs-down-outline' },
  callback: { label: 'Callback', color: '#F59E0B', bg: 'bg-amber-50', icon: 'alarm-outline' },
  no_answer: { label: 'No answer', color: '#64748B', bg: 'bg-ink-100', icon: 'call-outline' },
  busy: { label: 'Busy', color: '#0EA5E9', bg: 'bg-sky-50', icon: 'time-outline' },
  wrong_number: { label: 'Wrong number', color: '#F43F5E', bg: 'bg-rose-50', icon: 'alert-circle-outline' },
  converted: { label: 'Converted', color: '#8B5CF6', bg: 'bg-violet-50', icon: 'trophy-outline' },
  closed: { label: 'Closed', color: '#94A3B8', bg: 'bg-ink-100', icon: 'lock-closed-outline' },
};

const ROUTE_META = {
  sip: { label: 'SIP', color: '#444CE7' },
  sim: { label: 'SIM', color: '#10B981' },
  voip: { label: 'VoIP', color: '#8B5CF6' },
};

export function ReportsScreen() {
  const [range, setRange] = useState<ReportRange>('last7');
  const [data, setData] = useState<FullReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async (format: ExportFormat) => {
    if (!data) return;
    setPickerOpen(false);
    setExporting(format);
    const res = await exportReport(data, range, format);
    setExporting(null);
    if (!res.ok) {
      Alert.alert('Export failed', res.message ?? 'Could not export the report.');
      return;
    }
    if (res.mode === 'downloads') {
      Alert.alert(
        'Saved',
        `Report saved to your chosen folder as ${format.toUpperCase()}. Open Files / Drive to view it.`,
      );
    }
  };

  const load = useCallback(async () => {
    setError(null);
    try {
      const r = await reportsApi.full(range);
      setData(r);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [range]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <View className="flex-1 bg-bg dark:bg-ink-900">
      <GradientHeader
        title="Reports"
        subtitle="Your performance overview"
        right={
          <Pressable
            onPress={() => setPickerOpen(true)}
            disabled={!data || exporting !== null}
            hitSlop={6}
            className="px-3 py-1.5 rounded-full flex-row items-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', opacity: !data || exporting ? 0.6 : 1 }}
          >
            {exporting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="download-outline" size={14} color="#fff" />
            )}
            <Text className="text-white text-xs font-semibold ml-1.5">Export</Text>
          </Pressable>
        }
      />
      <View className="px-4 pt-3 pb-3 bg-white dark:bg-ink-800 border-b border-ink-100 dark:border-ink-700">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {RANGES.map((r) => (
            <FilterChip
              key={r.value}
              label={r.label}
              active={range === r.value}
              onPress={() => setRange(r.value)}
            />
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <LoadingState />
      ) : error || !data ? (
        <ErrorState message={error ?? 'Could not load report.'} onRetry={load} />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#444CE7" />}
          showsVerticalScrollIndicator={false}
        >
          <KpiStrip data={data} />
          <ByDayChart data={data} />
          <DispositionCard data={data} />
          <RouteCard data={data} />
          <CampaignLeaderboard data={data} />
        </ScrollView>
      )}

      <BottomSheet
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Export report as"
      >
        <FormatRow
          icon="document-text-outline"
          color="#10B981"
          bg="bg-emerald-50"
          label="CSV"
          desc="Plain spreadsheet · opens in Excel, Sheets, Numbers"
          loading={exporting === 'csv'}
          disabled={exporting !== null}
          onPress={() => handleExport('csv')}
        />
        <FormatRow
          icon="grid-outline"
          color="#0EA5E9"
          bg="bg-sky-50"
          label="Excel (.xlsx)"
          desc="Native workbook · 5 tabs, column widths preserved"
          loading={exporting === 'xlsx'}
          disabled={exporting !== null}
          onPress={() => handleExport('xlsx')}
        />
        <FormatRow
          icon="document-attach-outline"
          color="#EF4444"
          bg="bg-rose-50"
          label="PDF"
          desc="Print-ready · KPI cards, tables, branded layout"
          loading={exporting === 'pdf'}
          disabled={exporting !== null}
          onPress={() => handleExport('pdf')}
        />
      </BottomSheet>
    </View>
  );
}

function FormatRow({
  icon,
  color,
  bg,
  label,
  desc,
  loading,
  disabled,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  label: string;
  desc: string;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="flex-row items-center p-3 mb-2 rounded-2xl border border-ink-200 dark:border-ink-700 active:bg-ink-50 dark:active:bg-ink-700"
      style={{ opacity: disabled && !loading ? 0.5 : 1 }}
    >
      <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-3 ${bg}`}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View className="flex-1">
        <Text className="text-ink-900 dark:text-white font-bold text-base">{label}</Text>
        <Text className="text-ink-500 dark:text-ink-400 text-xs mt-0.5">{desc}</Text>
      </View>
      {loading ? (
        <ActivityIndicator color={color} size="small" />
      ) : (
        <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
      )}
    </Pressable>
  );
}

function KpiStrip({ data }: { data: FullReport }) {
  const s = data.summary;
  return (
    <View className="mb-4">
      <View className="flex-row flex-wrap">
        <Kpi label="Total calls" value={s.total_calls} icon="call-outline" tone="brand" />
        <Kpi label="Connected" value={s.connected_calls} icon="checkmark-circle-outline" tone="success" />
      </View>
      <View className="flex-row flex-wrap">
        <Kpi label="Connect rate" value={`${s.connect_rate}%`} icon="trending-up-outline" tone="sky" />
        <Kpi label="Avg duration" value={formatDuration(s.avg_duration)} icon="time-outline" tone="warn" />
      </View>
      <View className="flex-row flex-wrap">
        <Kpi label="Missed" value={s.missed_calls} icon="close-circle-outline" tone="danger" />
        <Kpi label="Conversions" value={s.conversions} icon="trophy-outline" tone="violet" />
      </View>
    </View>
  );
}

function Kpi({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number | string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: 'brand' | 'success' | 'warn' | 'danger' | 'sky' | 'violet';
}) {
  const map = {
    brand: { bg: 'bg-brand-50', color: '#444CE7' },
    success: { bg: 'bg-emerald-50', color: '#10B981' },
    warn: { bg: 'bg-amber-50', color: '#F59E0B' },
    danger: { bg: 'bg-rose-50', color: '#EF4444' },
    sky: { bg: 'bg-sky-50', color: '#0EA5E9' },
    violet: { bg: 'bg-violet-50', color: '#8B5CF6' },
  };
  const c = map[tone];
  return (
    <View
      className="flex-1 mr-2 mb-2 bg-white dark:bg-ink-800 rounded-2xl p-3.5 border border-ink-200 dark:border-ink-700 flex-row items-center"
      style={{ elevation: 1 }}
    >
      <View className={`w-11 h-11 rounded-2xl items-center justify-center mr-3 ${c.bg}`}>
        <Ionicons name={icon} size={20} color={c.color} />
      </View>
      <View className="flex-1">
        <Text className="text-xl font-bold text-ink-900 dark:text-white">{value}</Text>
        <Text className="text-ink-500 dark:text-ink-400 text-xs font-semibold" numberOfLines={1}>
          {label}
        </Text>
      </View>
    </View>
  );
}

function ByDayChart({ data }: { data: FullReport }) {
  const days = data.by_day;
  const max = useMemo(() => Math.max(1, ...days.map((d) => d.total)), [days]);
  const limited = days.length > 14 ? days.slice(-14) : days;

  return (
    <View
      className="bg-white dark:bg-ink-800 rounded-2xl p-4 mb-4 border border-ink-200 dark:border-ink-700"
      style={{ elevation: 1 }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View>
          <Text className="text-ink-900 dark:text-white text-base font-bold">Calls per day</Text>
          <Text className="text-ink-500 dark:text-ink-400 text-xs mt-0.5">
            Total bar height · connected portion in green
          </Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-2 h-2 rounded-full bg-emerald-500 mr-1" />
          <Text className="text-[10px] text-ink-500 dark:text-ink-400 font-semibold mr-2">CONN</Text>
          <View className="w-2 h-2 rounded-full bg-brand-400 mr-1" />
          <Text className="text-[10px] text-ink-500 dark:text-ink-400 font-semibold">TOTAL</Text>
        </View>
      </View>

      <View style={{ height: 140, flexDirection: 'row', alignItems: 'flex-end' }}>
        {limited.map((d) => {
          const totalH = (d.total / max) * 130;
          const connH = d.total ? (d.connected / d.total) * totalH : 0;
          return (
            <View key={d.date} style={{ flex: 1, alignItems: 'center', marginHorizontal: 1 }}>
              <View
                style={{
                  width: '70%',
                  height: Math.max(2, totalH),
                  backgroundColor: '#C7D2FE',
                  borderTopLeftRadius: 4,
                  borderTopRightRadius: 4,
                  overflow: 'hidden',
                  justifyContent: 'flex-end',
                }}
              >
                <View
                  style={{
                    height: connH,
                    backgroundColor: '#10B981',
                  }}
                />
              </View>
            </View>
          );
        })}
      </View>
      <View className="flex-row mt-2">
        {limited.map((d, i) => (
          <View key={d.date} style={{ flex: 1, alignItems: 'center' }}>
            {i % Math.ceil(limited.length / 7) === 0 ? (
              <Text className="text-[9px] text-ink-400 dark:text-ink-500">
                {d.date.slice(5)}
              </Text>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

function DispositionCard({ data }: { data: FullReport }) {
  const total = data.by_disposition.reduce((a, b) => a + b.count, 0);
  const max = Math.max(1, ...data.by_disposition.map((d) => d.count));
  return (
    <View
      className="bg-white dark:bg-ink-800 rounded-2xl p-4 mb-4 border border-ink-200 dark:border-ink-700"
      style={{ elevation: 1 }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-ink-900 dark:text-white text-base font-bold">Dispositions</Text>
        <Text className="text-ink-400 dark:text-ink-500 text-xs">{total} total</Text>
      </View>
      {data.by_disposition.map((d) => {
        const meta = DISPO_META[d.status];
        const pct = total ? Math.round((d.count / total) * 100) : 0;
        const width = (d.count / max) * 100;
        return (
          <View key={d.status} className="mb-2.5">
            <View className="flex-row items-center mb-1">
              <View className={`w-6 h-6 rounded-md items-center justify-center mr-2 ${meta.bg}`}>
                <Ionicons name={meta.icon} size={12} color={meta.color} />
              </View>
              <Text className="text-ink-900 dark:text-white text-sm flex-1 font-medium">{meta.label}</Text>
              <Text className="text-ink-700 dark:text-ink-200 text-sm font-bold">{d.count}</Text>
              <Text className="text-ink-400 dark:text-ink-500 text-xs ml-2 w-9 text-right">{pct}%</Text>
            </View>
            <View className="h-2 bg-ink-100 dark:bg-ink-700 rounded-full overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{ width: `${width}%`, backgroundColor: meta.color }}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

function RouteCard({ data }: { data: FullReport }) {
  const total = data.by_route.reduce((a, b) => a + b.count, 0);
  return (
    <View
      className="bg-white dark:bg-ink-800 rounded-2xl p-4 mb-4 border border-ink-200 dark:border-ink-700"
      style={{ elevation: 1 }}
    >
      <Text className="text-ink-900 dark:text-white text-base font-bold mb-3">Calls by route</Text>
      {/* Segmented bar */}
      <View className="h-3 rounded-full overflow-hidden flex-row bg-ink-100 dark:bg-ink-700 mb-3">
        {data.by_route.map((r) => {
          const w = total ? (r.count / total) * 100 : 0;
          if (w === 0) return null;
          return (
            <View
              key={r.route}
              style={{ width: `${w}%`, backgroundColor: ROUTE_META[r.route].color }}
            />
          );
        })}
      </View>
      <View className="flex-row">
        {data.by_route.map((r) => {
          const pct = total ? Math.round((r.count / total) * 100) : 0;
          return (
            <View key={r.route} className="flex-1 items-center">
              <View className="flex-row items-center mb-1">
                <View
                  className="w-2 h-2 rounded-full mr-1"
                  style={{ backgroundColor: ROUTE_META[r.route].color }}
                />
                <Text className="text-[10px] text-ink-500 dark:text-ink-400 font-bold uppercase tracking-wide">
                  {ROUTE_META[r.route].label}
                </Text>
              </View>
              <Text className="text-ink-900 dark:text-white text-lg font-bold">{r.count}</Text>
              <Text className="text-ink-400 dark:text-ink-500 text-xs">{pct}%</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function CampaignLeaderboard({ data }: { data: FullReport }) {
  const sorted = [...data.by_campaign].sort((a, b) => b.total - a.total).slice(0, 5);
  const max = Math.max(1, ...sorted.map((c) => c.total));
  if (!sorted.length) return null;
  return (
    <View
      className="bg-white dark:bg-ink-800 rounded-2xl p-4 mb-2 border border-ink-200 dark:border-ink-700"
      style={{ elevation: 1 }}
    >
      <Text className="text-ink-900 dark:text-white text-base font-bold mb-3">Top campaigns</Text>
      {sorted.map((c, i) => {
        const width = (c.total / max) * 100;
        return (
          <View key={c.campaign_id} className="mb-3 last:mb-0">
            <View className="flex-row items-center mb-1">
              <View className="w-6 h-6 rounded-full bg-brand-50 items-center justify-center mr-2">
                <Text className="text-brand-700 text-[10px] font-bold">{i + 1}</Text>
              </View>
              <Text className="text-ink-900 dark:text-white text-sm flex-1 font-semibold" numberOfLines={1}>
                {c.campaign_name}
              </Text>
              <View className="flex-row items-center">
                <Text className="text-ink-700 dark:text-ink-200 text-sm font-bold mr-2">{c.total}</Text>
                <View className="px-2 py-0.5 rounded bg-violet-50">
                  <Text className="text-[10px] font-bold text-violet-700">{c.conversion_rate}% CONV</Text>
                </View>
              </View>
            </View>
            <View className="h-2 bg-ink-100 dark:bg-ink-700 rounded-full overflow-hidden ml-8">
              <View
                className="h-full bg-brand-600 rounded-full"
                style={{ width: `${width}%` }}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}
