import { axiosClient } from './axiosClient';
import { endpoints } from './endpoints';
import { Campaign } from '@/types/campaign';
import { Paginated } from '@/types/api';
import { mockCampaigns, shouldUseMock } from './_mock';

export const campaignsApi = {
  async list(): Promise<Campaign[]> {
    try {
      const { data } = await axiosClient.get<Campaign[] | Paginated<Campaign>>(
        endpoints.campaigns.list,
      );
      return Array.isArray(data) ? data : data.results;
    } catch (e) {
      if (shouldUseMock(e)) return mockCampaigns;
      throw e;
    }
  },

  async detail(id: number): Promise<Campaign> {
    try {
      const { data } = await axiosClient.get<Campaign>(endpoints.campaigns.detail(id));
      return data;
    } catch (e) {
      if (shouldUseMock(e)) {
        const c = mockCampaigns.find((m) => m.id === id);
        if (c) return c;
      }
      throw e;
    }
  },
};
