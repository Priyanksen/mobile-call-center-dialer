import * as Contacts from 'expo-contacts';
import { Alert } from 'react-native';
import { Lead } from '@/types/lead';
import { normalizePhone, isValidPhone } from './phone';

export interface PickableContact {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
}

export async function loadDeviceContacts(): Promise<PickableContact[]> {
  const perm = await Contacts.requestPermissionsAsync();
  if (!perm.granted) {
    Alert.alert('Permission needed', 'Allow contacts access to import leads from your phone.');
    return [];
  }
  const { data } = await Contacts.getContactsAsync({
    fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails, Contacts.Fields.Name],
    sort: Contacts.SortTypes.FirstName,
  });
  const out: PickableContact[] = [];
  for (const c of data) {
    const name = c.name ?? '';
    const phoneRaw = c.phoneNumbers?.[0]?.number ?? '';
    const phone = normalizePhone(phoneRaw);
    if (!name || !phone || !isValidPhone(phone)) continue;
    out.push({
      id: c.id ?? `${name}-${phone}`,
      name,
      phone,
      email: c.emails?.[0]?.email ?? null,
    });
  }
  return out;
}

export function contactToLead(c: PickableContact): Omit<Lead, 'id'> {
  return {
    name: c.name,
    phone: c.phone,
    email: c.email ?? null,
    status: 'new',
    priority: 'medium',
    city: null,
    campaign_name: null,
    notes: null,
  };
}
