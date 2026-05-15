import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from '@/components/common/BottomSheet';
import { AppButton } from '@/components/common/AppButton';
import { AppInput } from '@/components/common/AppInput';
import { leadsApi } from '@/api/leadsApi';
import { isValidPhone, normalizePhone } from '@/utils/phone';
import { isEmail, isNonEmpty } from '@/utils/validators';
import { pickCsv, ParsedRow } from '@/utils/csvImport';
import { loadDeviceContacts, contactToLead, PickableContact } from '@/utils/contactsImport';
import { Lead } from '@/types/lead';

interface Props {
  visible: boolean;
  onClose: () => void;
  onImported: (count: number) => void;
}

type Mode = 'menu' | 'single' | 'csv-preview' | 'contacts';

export function ImportLeadsSheet({ visible, onClose, onImported }: Props) {
  const [mode, setMode] = useState<Mode>('menu');

  // Single-lead form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [campaign, setCampaign] = useState('');
  const [singleErr, setSingleErr] = useState<string | null>(null);
  const [savingSingle, setSavingSingle] = useState(false);

  // CSV state
  const [csvName, setCsvName] = useState<string | null>(null);
  const [csvRows, setCsvRows] = useState<ParsedRow[]>([]);
  const [csvImporting, setCsvImporting] = useState(false);

  // Contacts state
  const [contacts, setContacts] = useState<PickableContact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [contactsImporting, setContactsImporting] = useState(false);

  const closeAll = () => {
    setMode('menu');
    setName('');
    setPhone('');
    setEmail('');
    setCity('');
    setCampaign('');
    setSingleErr(null);
    setCsvName(null);
    setCsvRows([]);
    setContacts([]);
    setSelected(new Set());
    onClose();
  };

  const saveSingle = async () => {
    setSingleErr(null);
    if (!isNonEmpty(name)) return setSingleErr('Name is required.');
    const p = normalizePhone(phone);
    if (!p || !isValidPhone(p)) return setSingleErr('Valid phone is required.');
    if (email && !isEmail(email)) return setSingleErr('Invalid email.');
    setSavingSingle(true);
    try {
      await leadsApi.create({
        name: name.trim(),
        phone: p,
        email: email.trim() || null,
        city: city.trim() || null,
        campaign_name: campaign.trim() || null,
        status: 'new',
        priority: 'medium',
        notes: null,
      });
      onImported(1);
      closeAll();
    } catch (e) {
      Alert.alert('Add failed', (e as Error).message);
    } finally {
      setSavingSingle(false);
    }
  };

  const openCsvPicker = async () => {
    try {
      const res = await pickCsv();
      if (!res) return;
      setCsvName(res.name);
      setCsvRows(res.rows);
      setMode('csv-preview');
    } catch (e) {
      Alert.alert('Could not read CSV', (e as Error).message);
    }
  };

  const confirmCsvImport = async () => {
    const valid = csvRows.filter((r) => r.errors.length === 0).map((r) => r.lead);
    if (!valid.length) {
      Alert.alert('Nothing to import', 'All rows in the CSV have errors.');
      return;
    }
    setCsvImporting(true);
    const created = await leadsApi.bulkCreate(valid);
    setCsvImporting(false);
    onImported(created.length);
    closeAll();
  };

  const openContactsPicker = async () => {
    setMode('contacts');
    setContactsLoading(true);
    const list = await loadDeviceContacts();
    setContacts(list);
    setContactsLoading(false);
  };

  const toggleContact = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const confirmContactsImport = async () => {
    const picks = contacts.filter((c) => selected.has(c.id));
    if (!picks.length) return;
    setContactsImporting(true);
    const payloads: Omit<Lead, 'id'>[] = picks.map(contactToLead);
    const created = await leadsApi.bulkCreate(payloads);
    setContactsImporting(false);
    onImported(created.length);
    closeAll();
  };

  const title =
    mode === 'menu'
      ? 'Import leads'
      : mode === 'single'
        ? 'Add single lead'
        : mode === 'csv-preview'
          ? `Preview · ${csvName}`
          : 'Pick contacts';

  return (
    <BottomSheet visible={visible} onClose={closeAll} title={title}>
      {mode !== 'menu' ? (
        <Pressable onPress={() => setMode('menu')} className="flex-row items-center mb-3" hitSlop={6}>
          <Ionicons name="chevron-back" size={16} color="#444CE7" />
          <Text className="text-brand-700 text-sm font-semibold ml-1">Back</Text>
        </Pressable>
      ) : null}

      {mode === 'menu' ? (
        <View>
          <MethodRow
            icon="person-add-outline"
            color="#10B981"
            bg="bg-emerald-50"
            label="Add single lead"
            desc="Type one customer's details manually"
            onPress={() => setMode('single')}
          />
          <MethodRow
            icon="document-text-outline"
            color="#0EA5E9"
            bg="bg-sky-50"
            label="Upload CSV file"
            desc="Bulk import from a spreadsheet (Name, Phone, Email…)"
            onPress={openCsvPicker}
          />
          <MethodRow
            icon="people-outline"
            color="#8B5CF6"
            bg="bg-violet-50"
            label="From phone contacts"
            desc="Pick contacts already on your device"
            onPress={openContactsPicker}
          />
          <View className="mt-3 px-3 py-2 rounded-xl bg-amber-50 flex-row items-start">
            <Ionicons name="information-circle-outline" size={14} color="#F59E0B" style={{ marginTop: 1 }} />
            <Text className="text-amber-800 text-xs ml-2 flex-1">
              CSV headers supported: name, phone, email, city, campaign, status, priority, notes.
            </Text>
          </View>
        </View>
      ) : null}

      {mode === 'single' ? (
        <View>
          <AppInput label="Full name" value={name} onChangeText={setName} icon="person-outline" placeholder="Customer name" />
          <AppInput
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            icon="call-outline"
            keyboardType="phone-pad"
            placeholder="+91 98xxxxxxxx"
          />
          <AppInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            icon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="optional"
          />
          <AppInput label="City" value={city} onChangeText={setCity} icon="location-outline" placeholder="optional" />
          <AppInput
            label="Campaign"
            value={campaign}
            onChangeText={setCampaign}
            icon="megaphone-outline"
            placeholder="optional"
          />
          {singleErr ? (
            <Text className="text-rose-600 text-xs mb-2">{singleErr}</Text>
          ) : null}
          <AppButton label="Add lead" onPress={saveSingle} loading={savingSingle} fullWidth icon="save-outline" />
        </View>
      ) : null}

      {mode === 'csv-preview' ? (
        <View>
          <View className="flex-row mb-3 -mx-1">
            <Pill label={`${csvRows.length} rows`} bg="bg-ink-100" text="text-ink-700" />
            <Pill
              label={`${csvRows.filter((r) => r.errors.length === 0).length} valid`}
              bg="bg-emerald-50"
              text="text-emerald-700"
            />
            <Pill
              label={`${csvRows.filter((r) => r.errors.length > 0).length} errors`}
              bg="bg-rose-50"
              text="text-rose-700"
            />
          </View>
          <FlatList
            data={csvRows.slice(0, 50)}
            keyExtractor={(_, i) => String(i)}
            style={{ maxHeight: 240 }}
            renderItem={({ item }) => (
              <View
                className={`p-3 mb-2 rounded-xl border ${
                  item.errors.length
                    ? 'border-rose-200 bg-rose-50/40'
                    : 'border-ink-200 dark:border-ink-700'
                }`}
              >
                <Text className="text-ink-900 dark:text-white font-semibold" numberOfLines={1}>
                  {item.lead.name} · <Text className="text-ink-500">{item.lead.phone}</Text>
                </Text>
                {item.errors.length ? (
                  <Text className="text-rose-700 text-xs mt-1">{item.errors.join(' · ')}</Text>
                ) : null}
              </View>
            )}
          />
          {csvRows.length > 50 ? (
            <Text className="text-ink-400 text-xs text-center mt-1 mb-2">
              Showing first 50 — rest will still be imported
            </Text>
          ) : null}
          <View className="h-2" />
          <AppButton
            label={`Import ${csvRows.filter((r) => r.errors.length === 0).length} leads`}
            onPress={confirmCsvImport}
            loading={csvImporting}
            fullWidth
            icon="cloud-upload-outline"
          />
        </View>
      ) : null}

      {mode === 'contacts' ? (
        contactsLoading ? (
          <View className="items-center py-8">
            <ActivityIndicator color="#444CE7" />
            <Text className="text-ink-500 text-xs mt-2">Loading contacts…</Text>
          </View>
        ) : contacts.length === 0 ? (
          <View className="items-center py-6">
            <Text className="text-ink-500 text-sm">No contacts with phone numbers found.</Text>
          </View>
        ) : (
          <View>
            <Text className="text-ink-500 dark:text-ink-400 text-xs mb-2">
              {selected.size} of {contacts.length} selected
            </Text>
            <FlatList
              data={contacts}
              keyExtractor={(c) => c.id}
              style={{ maxHeight: 320 }}
              renderItem={({ item }) => {
                const on = selected.has(item.id);
                return (
                  <Pressable
                    onPress={() => toggleContact(item.id)}
                    className={`p-3 mb-1.5 rounded-xl flex-row items-center ${
                      on ? 'bg-brand-50' : 'bg-ink-50 dark:bg-ink-700'
                    }`}
                  >
                    <View
                      className={`w-5 h-5 rounded-md border-2 mr-3 items-center justify-center ${
                        on ? 'bg-brand-600 border-brand-600' : 'border-ink-300 dark:border-ink-500'
                      }`}
                    >
                      {on ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`text-sm font-semibold ${on ? 'text-brand-700' : 'text-ink-900 dark:text-white'}`}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      <Text className="text-ink-500 dark:text-ink-400 text-xs">{item.phone}</Text>
                    </View>
                  </Pressable>
                );
              }}
            />
            <View className="h-2" />
            <AppButton
              label={`Import ${selected.size} ${selected.size === 1 ? 'contact' : 'contacts'}`}
              onPress={confirmContactsImport}
              loading={contactsImporting}
              fullWidth
              disabled={selected.size === 0}
              icon="cloud-upload-outline"
            />
          </View>
        )
      ) : null}
    </BottomSheet>
  );
}

function MethodRow({
  icon,
  color,
  bg,
  label,
  desc,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  label: string;
  desc: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center p-3 mb-2 rounded-2xl border border-ink-200 dark:border-ink-700 active:bg-ink-50 dark:active:bg-ink-700"
    >
      <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-3 ${bg}`}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View className="flex-1">
        <Text className="text-ink-900 dark:text-white font-bold text-base">{label}</Text>
        <Text className="text-ink-500 dark:text-ink-400 text-xs mt-0.5">{desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
    </Pressable>
  );
}

function Pill({ label, bg, text }: { label: string; bg: string; text: string }) {
  return (
    <View className={`px-2 py-1 rounded-full mx-1 ${bg}`}>
      <Text className={`text-[10px] font-bold ${text}`}>{label.toUpperCase()}</Text>
    </View>
  );
}
