import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import * as XLSX from 'xlsx';
import { Platform } from 'react-native';
import { FullReport, ReportRange } from '@/types/report';
import { formatDuration } from './formatDuration';

const RANGE_LABEL: Record<ReportRange, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  last7: 'Last 7 days',
};

export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

const MIME: Record<ExportFormat, string> = {
  csv: 'text/csv',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pdf: 'application/pdf',
};

export interface ExportResult {
  ok: boolean;
  path?: string;
  mode?: 'downloads' | 'shared' | 'cancelled';
  message?: string;
}

// ─── CSV ──────────────────────────────────────────────────────────────────

function csvCell(v: string | number | null | undefined): string {
  if (v == null) return '';
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function row(cells: (string | number | null | undefined)[]): string {
  return cells.map(csvCell).join(',');
}

function buildCsv(report: FullReport, range: ReportRange): string {
  const lines: string[] = [];
  lines.push(`Agent Dialer — Call Report`);
  lines.push(`Range,${RANGE_LABEL[range]}`);
  lines.push(`Generated,${new Date().toISOString()}`);
  lines.push('');
  lines.push('SUMMARY');
  lines.push(row(['Metric', 'Value']));
  lines.push(row(['Total calls', report.summary.total_calls]));
  lines.push(row(['Connected', report.summary.connected_calls]));
  lines.push(row(['Connect rate (%)', report.summary.connect_rate]));
  lines.push(row(['Missed', report.summary.missed_calls]));
  lines.push(row(['Callbacks', report.summary.callbacks]));
  lines.push(row(['Conversions', report.summary.conversions]));
  lines.push(row(['Avg duration', formatDuration(report.summary.avg_duration)]));
  lines.push('');
  lines.push('CALLS PER DAY');
  lines.push(row(['Date', 'Total', 'Connected']));
  for (const d of report.by_day) lines.push(row([d.date, d.total, d.connected]));
  lines.push('');
  lines.push('DISPOSITIONS');
  lines.push(row(['Status', 'Count']));
  for (const d of report.by_disposition) lines.push(row([d.status.replace(/_/g, ' '), d.count]));
  lines.push('');
  lines.push('BY ROUTE');
  lines.push(row(['Route', 'Count']));
  for (const r of report.by_route) lines.push(row([r.route.toUpperCase(), r.count]));
  lines.push('');
  lines.push('BY CAMPAIGN');
  lines.push(row(['Campaign', 'Total', 'Connected', 'Conversions', 'Conversion rate (%)']));
  for (const c of report.by_campaign)
    lines.push(row([c.campaign_name, c.total, c.connected, c.conversions, c.conversion_rate]));
  if (report.notes_activity?.length) {
    lines.push('');
    lines.push('NOTES ACTIVITY');
    lines.push(row(['Lead', 'Notes count', 'Last updated', 'Last note']));
    for (const n of report.notes_activity)
      lines.push(row([n.lead_name, n.notes_count, n.updated_at, n.last_note]));
  }
  return lines.join('\n');
}

// ─── XLSX ─────────────────────────────────────────────────────────────────

function buildXlsxBase64(report: FullReport, range: ReportRange): string {
  const wb = XLSX.utils.book_new();

  const summary = [
    ['Agent Dialer — Call Report'],
    ['Range', RANGE_LABEL[range]],
    ['Generated', new Date().toISOString()],
    [],
    ['Metric', 'Value'],
    ['Total calls', report.summary.total_calls],
    ['Connected', report.summary.connected_calls],
    ['Connect rate (%)', report.summary.connect_rate],
    ['Missed', report.summary.missed_calls],
    ['Callbacks', report.summary.callbacks],
    ['Conversions', report.summary.conversions],
    ['Avg duration', formatDuration(report.summary.avg_duration)],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summary);
  wsSummary['!cols'] = [{ wch: 22 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  const byDay = [['Date', 'Total', 'Connected'], ...report.by_day.map((d) => [d.date, d.total, d.connected])];
  const wsDay = XLSX.utils.aoa_to_sheet(byDay);
  wsDay['!cols'] = [{ wch: 14 }, { wch: 10 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, wsDay, 'Calls per day');

  const byDispo = [
    ['Status', 'Count'],
    ...report.by_disposition.map((d) => [d.status.replace(/_/g, ' '), d.count]),
  ];
  const wsDispo = XLSX.utils.aoa_to_sheet(byDispo);
  wsDispo['!cols'] = [{ wch: 18 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, wsDispo, 'Dispositions');

  const byRoute = [
    ['Route', 'Count'],
    ...report.by_route.map((r) => [r.route.toUpperCase(), r.count]),
  ];
  const wsRoute = XLSX.utils.aoa_to_sheet(byRoute);
  wsRoute['!cols'] = [{ wch: 10 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, wsRoute, 'By route');

  const byCamp = [
    ['Campaign', 'Total', 'Connected', 'Conversions', 'Conversion rate (%)'],
    ...report.by_campaign.map((c) => [
      c.campaign_name,
      c.total,
      c.connected,
      c.conversions,
      c.conversion_rate,
    ]),
  ];
  const wsCamp = XLSX.utils.aoa_to_sheet(byCamp);
  wsCamp['!cols'] = [{ wch: 28 }, { wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(wb, wsCamp, 'By campaign');

  if (report.notes_activity?.length) {
    const notesRows = [
      ['Lead', 'Notes count', 'Last updated', 'Last note'],
      ...report.notes_activity.map((n) => [n.lead_name, n.notes_count, n.updated_at, n.last_note]),
    ];
    const wsNotes = XLSX.utils.aoa_to_sheet(notesRows);
    wsNotes['!cols'] = [{ wch: 24 }, { wch: 12 }, { wch: 22 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(wb, wsNotes, 'Notes activity');
  }

  return XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
}

// ─── PDF ──────────────────────────────────────────────────────────────────

function esc(s: string | number): string {
  return String(s).replace(/[&<>"']/g, (m) =>
    m === '&' ? '&amp;' : m === '<' ? '&lt;' : m === '>' ? '&gt;' : m === '"' ? '&quot;' : '&#39;',
  );
}

function buildPdfHtml(report: FullReport, range: ReportRange): string {
  const s = report.summary;
  const dayRows = report.by_day
    .map((d) => `<tr><td>${esc(d.date)}</td><td>${d.total}</td><td>${d.connected}</td></tr>`)
    .join('');
  const dispoRows = report.by_disposition
    .map((d) => `<tr><td>${esc(d.status.replace(/_/g, ' '))}</td><td>${d.count}</td></tr>`)
    .join('');
  const routeRows = report.by_route
    .map((r) => `<tr><td>${esc(r.route.toUpperCase())}</td><td>${r.count}</td></tr>`)
    .join('');
  const campRows = report.by_campaign
    .map(
      (c) =>
        `<tr><td>${esc(c.campaign_name)}</td><td>${c.total}</td><td>${c.connected}</td><td>${c.conversions}</td><td>${c.conversion_rate}%</td></tr>`,
    )
    .join('');
  const noteRows = (report.notes_activity ?? [])
    .map(
      (n) =>
        `<tr><td>${esc(n.lead_name)}</td><td>${n.notes_count}</td><td>${esc(new Date(n.updated_at).toLocaleString())}</td><td>${esc(n.last_note)}</td></tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; color: #0B1220; margin: 32px; }
  h1 { margin: 0 0 4px; font-size: 22px; color: #3538CD; }
  .meta { color: #64748B; font-size: 12px; margin-bottom: 20px; }
  h2 { font-size: 14px; color: #0B1220; margin: 24px 0 8px; padding-bottom: 6px; border-bottom: 2px solid #E2E8F0; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { text-align: left; padding: 8px 10px; background: #EEF4FF; color: #3538CD; font-weight: 700; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; }
  td { padding: 8px 10px; border-bottom: 1px solid #F1F5F9; }
  .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 8px; }
  .kpi { border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px; }
  .kpi-label { font-size: 9px; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; }
  .kpi-value { font-size: 20px; font-weight: 800; margin-top: 4px; color: #0B1220; }
  .footer { margin-top: 32px; font-size: 10px; color: #94A3B8; text-align: center; }
</style></head>
<body>
  <h1>Agent Dialer — Call Report</h1>
  <div class="meta">Range: <b>${esc(RANGE_LABEL[range])}</b> · Generated ${esc(new Date().toLocaleString())}</div>

  <h2>Summary</h2>
  <div class="kpi-grid">
    <div class="kpi"><div class="kpi-label">Total calls</div><div class="kpi-value">${s.total_calls}</div></div>
    <div class="kpi"><div class="kpi-label">Connected</div><div class="kpi-value">${s.connected_calls}</div></div>
    <div class="kpi"><div class="kpi-label">Connect rate</div><div class="kpi-value">${s.connect_rate}%</div></div>
    <div class="kpi"><div class="kpi-label">Missed</div><div class="kpi-value">${s.missed_calls}</div></div>
    <div class="kpi"><div class="kpi-label">Conversions</div><div class="kpi-value">${s.conversions}</div></div>
    <div class="kpi"><div class="kpi-label">Avg duration</div><div class="kpi-value">${esc(formatDuration(s.avg_duration))}</div></div>
  </div>

  <h2>Calls per day</h2>
  <table><thead><tr><th>Date</th><th>Total</th><th>Connected</th></tr></thead><tbody>${dayRows}</tbody></table>

  <h2>Dispositions</h2>
  <table><thead><tr><th>Status</th><th>Count</th></tr></thead><tbody>${dispoRows}</tbody></table>

  <h2>By route</h2>
  <table><thead><tr><th>Route</th><th>Count</th></tr></thead><tbody>${routeRows}</tbody></table>

  <h2>By campaign</h2>
  <table><thead><tr><th>Campaign</th><th>Total</th><th>Connected</th><th>Conv.</th><th>Conv. rate</th></tr></thead><tbody>${campRows}</tbody></table>

  ${
    noteRows
      ? `<h2>Notes activity</h2>
  <table><thead><tr><th>Lead</th><th>Notes</th><th>Last updated</th><th>Last note</th></tr></thead><tbody>${noteRows}</tbody></table>`
      : ''
  }

  <div class="footer">Generated by Agent Dialer · bol7</div>
</body></html>`;
}

// ─── Save / Share ─────────────────────────────────────────────────────────

async function saveToDevice(args: {
  filename: string;
  format: ExportFormat;
  /** Plain text content for csv. */
  text?: string;
  /** Base64 content for binary formats. */
  base64?: string;
  /** For PDF we already have a file URI from expo-print. */
  existingUri?: string;
}): Promise<ExportResult> {
  const mime = MIME[args.format];

  // Android: ask user to pick directory and save there.
  if (Platform.OS === 'android') {
    const perm = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (perm.granted) {
      const baseName = args.filename.replace(/\.[a-z0-9]+$/i, '');
      const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
        perm.directoryUri,
        baseName,
        mime,
      );
      if (args.text != null) {
        await FileSystem.writeAsStringAsync(fileUri, args.text, {
          encoding: FileSystem.EncodingType.UTF8,
        });
      } else if (args.base64 != null) {
        await FileSystem.writeAsStringAsync(fileUri, args.base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } else if (args.existingUri) {
        const content = await FileSystem.readAsStringAsync(args.existingUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await FileSystem.writeAsStringAsync(fileUri, content, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }
      return { ok: true, path: fileUri, mode: 'downloads' };
    }
    // user denied — fall through to share
  }

  // iOS / Android-fallback: write to cache and open share sheet
  let path: string;
  if (args.existingUri) {
    path = args.existingUri;
  } else {
    const dir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
    if (!dir) return { ok: false, message: 'Filesystem unavailable.' };
    path = dir + args.filename;
    if (args.text != null) {
      await FileSystem.writeAsStringAsync(path, args.text, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    } else if (args.base64 != null) {
      await FileSystem.writeAsStringAsync(path, args.base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }
  }
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(path, { mimeType: mime, dialogTitle: 'Save / Share report' });
    return { ok: true, path, mode: 'shared' };
  }
  return { ok: false, message: 'Sharing not available on this device.' };
}

// ─── Public API ───────────────────────────────────────────────────────────

export async function exportReport(
  report: FullReport,
  range: ReportRange,
  format: ExportFormat,
): Promise<ExportResult> {
  try {
    const dateTag = new Date().toISOString().slice(0, 10);
    const slug = RANGE_LABEL[range].toLowerCase().replace(/\s+/g, '-');
    const filename = `agent-dialer-report-${slug}-${dateTag}.${format}`;

    if (format === 'csv') {
      return await saveToDevice({ filename, format, text: buildCsv(report, range) });
    }
    if (format === 'xlsx') {
      return await saveToDevice({ filename, format, base64: buildXlsxBase64(report, range) });
    }
    // PDF — render via expo-print, then save/share
    const { uri } = await Print.printToFileAsync({ html: buildPdfHtml(report, range) });
    return await saveToDevice({ filename, format, existingUri: uri });
  } catch (e) {
    const msg = (e as Error).message ?? 'Unknown error.';
    if (/cancel/i.test(msg)) return { ok: true, mode: 'cancelled' };
    return { ok: false, message: msg };
  }
}
