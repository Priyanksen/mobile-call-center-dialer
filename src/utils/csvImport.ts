import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import { Lead, LeadPriority, LeadStatus } from '@/types/lead';
import { isValidPhone, normalizePhone } from './phone';
import { isEmail } from './validators';

export interface ParsedRow {
  raw: Record<string, string>;
  lead: Omit<Lead, 'id'>;
  errors: string[];
}

const HEADER_ALIASES: Record<string, keyof Omit<Lead, 'id'>> = {
  name: 'name',
  'full name': 'name',
  customer: 'name',
  phone: 'phone',
  mobile: 'phone',
  number: 'phone',
  'phone number': 'phone',
  email: 'email',
  'email address': 'email',
  city: 'city',
  campaign: 'campaign_name',
  'campaign name': 'campaign_name',
  status: 'status',
  priority: 'priority',
  notes: 'notes',
  note: 'notes',
};

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQ = !inQ;
      }
    } else if (ch === ',' && !inQ) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

export function parseCsv(text: string): ParsedRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const headers = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  const rows: ParsedRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]);
    const raw: Record<string, string> = {};
    headers.forEach((h, idx) => {
      raw[h] = cells[idx] ?? '';
    });
    const errors: string[] = [];
    const get = (key: keyof Omit<Lead, 'id'>): string => {
      for (const [alias, target] of Object.entries(HEADER_ALIASES)) {
        if (target === key && raw[alias]) return raw[alias];
      }
      return '';
    };
    const name = get('name');
    const phone = normalizePhone(get('phone'));
    const email = get('email');
    const status = get('status').toLowerCase() as LeadStatus;
    const priority = (get('priority').toLowerCase() || 'medium') as LeadPriority;

    if (!name) errors.push('Missing name');
    if (!phone) errors.push('Missing phone');
    else if (!isValidPhone(phone)) errors.push('Invalid phone');
    if (email && !isEmail(email)) errors.push('Invalid email');

    rows.push({
      raw,
      errors,
      lead: {
        name: name || '(unnamed)',
        phone,
        email: email || null,
        city: get('city') || null,
        campaign_name: get('campaign_name') || null,
        status: ['new', 'contacted', 'interested', 'not_interested', 'callback', 'converted', 'closed'].includes(
          status,
        )
          ? status
          : 'new',
        priority: ['low', 'medium', 'high', 'urgent'].includes(priority) ? priority : 'medium',
        notes: get('notes') || null,
      },
    });
  }
  return rows;
}

export async function pickCsv(): Promise<{ name: string; rows: ParsedRow[] } | null> {
  const res = await DocumentPicker.getDocumentAsync({
    type: ['text/csv', 'text/comma-separated-values', '*/*'],
    copyToCacheDirectory: true,
  });
  if (res.canceled) return null;
  const asset = res.assets?.[0];
  if (!asset?.uri) return null;
  const text = await FileSystem.readAsStringAsync(asset.uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  return { name: asset.name ?? 'import.csv', rows: parseCsv(text) };
}
