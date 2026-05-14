import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { Dropdown, DropdownOption } from '@/components/common/Dropdown';
import { LeadFilters as Filters, LeadStatus } from '@/types/lead';
import { Campaign } from '@/types/campaign';
import { campaignsApi } from '@/api/campaignsApi';

interface Props {
  value: Filters;
  onChange: (next: Filters) => void;
}

const STATUS_OPTIONS: DropdownOption<LeadStatus | 'all'>[] = [
  { label: 'All statuses', value: 'all' },
  { label: 'New', value: 'new' },
  { label: 'Contacted', value: 'contacted' },
  { label: 'Interested', value: 'interested' },
  { label: 'Follow-up', value: 'callback' },
  { label: 'Not interested', value: 'not_interested' },
  { label: 'Converted', value: 'converted' },
  { label: 'Closed', value: 'closed' },
];

const ORDERING_OPTIONS: DropdownOption<NonNullable<Filters['ordering']>>[] = [
  { label: 'Priority', value: 'priority' },
  { label: 'Latest first', value: '-created_at' },
  { label: 'Follow-up time', value: 'next_callback_at' },
];

export function LeadFilters({ value, onChange }: Props) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    let cancelled = false;
    campaignsApi
      .list()
      .then((cs) => {
        if (!cancelled) setCampaigns(cs);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const campaignOptions = useMemo<DropdownOption<number | 'all'>[]>(
    () => [
      { label: 'All campaigns', value: 'all' },
      ...campaigns.map((c) => ({ label: c.name, value: c.id })),
    ],
    [campaigns],
  );

  return (
    <View className="flex-row gap-2">
      <Dropdown
        label="Status"
        icon="filter-outline"
        value={value.status ?? 'all'}
        options={STATUS_OPTIONS}
        onChange={(v) => onChange({ ...value, status: v })}
      />
      <Dropdown
        label="Campaign"
        icon="megaphone-outline"
        value={value.campaign_id ?? 'all'}
        options={campaignOptions}
        onChange={(v) => onChange({ ...value, campaign_id: v })}
      />
      <Dropdown
        label="Sort"
        icon="swap-vertical-outline"
        value={value.ordering ?? 'priority'}
        options={ORDERING_OPTIONS}
        onChange={(v) => onChange({ ...value, ordering: v })}
      />
    </View>
  );
}
