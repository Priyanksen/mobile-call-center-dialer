import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SearchInput } from '@/components/common/SearchInput';
import { GradientHeader } from '@/components/common/GradientHeader';
import { LeadFilters } from '@/components/leads/LeadFilters';
import { LeadCard } from '@/components/leads/LeadCard';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { Lead, LeadFilters as Filters } from '@/types/lead';
import { leadsApi } from '@/api/leadsApi';
import { useDebounce } from '@/hooks/useDebounce';
import { RootStackParamList } from '@/navigation/types';

export function LeadListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 350);
  const [filters, setFilters] = useState<Filters>({ status: 'all', ordering: 'priority' });
  const [data, setData] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveFilters = useMemo<Filters>(
    () => ({ ...filters, search: debounced }),
    [filters, debounced],
  );

  const load = useCallback(async () => {
    setError(null);
    try {
      const list = await leadsApi.list(effectiveFilters);
      setData(list);
    } catch (e) {
      setError((e as Error).message || 'Could not load leads.');
    }
  }, [effectiveFilters]);

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
        title="My Leads"
        subtitle={`${data.length} ${data.length === 1 ? 'lead' : 'leads'}`}
      />
      <View className="px-4 pt-3 pb-2 bg-white dark:bg-ink-800 border-b border-ink-100 dark:border-ink-700">
        <SearchInput value={search} onChangeText={setSearch} placeholder="Search by name or phone" />
        <LeadFilters value={filters} onChange={setFilters} />
      </View>
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(l) => String(l.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#444CE7" />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              title="No leads"
              message="Try a different filter or pull down to refresh."
              icon="people-outline"
            />
          }
          renderItem={({ item }) => (
            <LeadCard lead={item} onPress={() => navigation.navigate('LeadDetail', { leadId: item.id })} />
          )}
        />
      )}
    </View>
  );
}
