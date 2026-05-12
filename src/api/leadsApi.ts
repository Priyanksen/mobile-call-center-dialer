import { axiosClient } from './axiosClient';
import { endpoints } from './endpoints';
import { Lead, LeadFilters } from '@/types/lead';
import { Paginated } from '@/types/api';
import { mockLeads, shouldUseMock } from './_mock';

function toParams(f?: LeadFilters): Record<string, string | number> {
  if (!f) return {};
  const p: Record<string, string | number> = {};
  if (f.search) p.search = f.search;
  if (f.status && f.status !== 'all') p.status = f.status;
  if (f.campaign_id && f.campaign_id !== 'all') p.campaign_id = f.campaign_id;
  if (f.ordering) p.ordering = f.ordering;
  return p;
}

function applyFiltersLocally(list: Lead[], filters?: LeadFilters): Lead[] {
  if (!filters) return list;
  let result = list;
  if (filters.search) {
    const q = filters.search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.phone.toLowerCase().includes(q) ||
          (l.email ?? '').toLowerCase().includes(q),
      );
    }
  }
  if (filters.status && filters.status !== 'all') {
    result = result.filter((l) => l.status === filters.status);
  }
  if (filters.campaign_id && filters.campaign_id !== 'all') {
    result = result.filter((l) => l.campaign_id === filters.campaign_id);
  }
  if (filters.ordering === 'priority') {
    const order: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
    result = [...result].sort((a, b) => (order[a.priority] ?? 9) - (order[b.priority] ?? 9));
  } else if (filters.ordering === 'next_callback_at') {
    result = [...result].sort((a, b) => {
      const ax = a.next_callback_at ? new Date(a.next_callback_at).getTime() : Infinity;
      const bx = b.next_callback_at ? new Date(b.next_callback_at).getTime() : Infinity;
      return ax - bx;
    });
  }
  return result;
}

export const leadsApi = {
  async list(filters?: LeadFilters): Promise<Lead[]> {
    try {
      const { data } = await axiosClient.get<Lead[] | Paginated<Lead>>(endpoints.leads.list, {
        params: toParams(filters),
      });
      const list = Array.isArray(data) ? data : data.results;
      return applyFiltersLocally(list, filters);
    } catch (e) {
      if (shouldUseMock(e)) return applyFiltersLocally(mockLeads, filters);
      throw e;
    }
  },

  async detail(id: number): Promise<Lead> {
    try {
      const { data } = await axiosClient.get<Lead>(endpoints.leads.detail(id));
      return data;
    } catch (e) {
      if (shouldUseMock(e)) {
        const l = mockLeads.find((m) => m.id === id);
        if (l) return l;
      }
      throw e;
    }
  },

  async next(): Promise<Lead | null> {
    try {
      const { data } = await axiosClient.get<Lead | null>(endpoints.leads.next);
      return data;
    } catch (e) {
      if (shouldUseMock(e)) return mockLeads[0];
      throw e;
    }
  },

  async update(id: number, patch: Partial<Lead>): Promise<Lead> {
    const { data } = await axiosClient.patch<Lead>(endpoints.leads.detail(id), patch);
    return data;
  },
};
