import { axiosClient } from './axiosClient';
import { endpoints } from './endpoints';
import { Callback, CreateCallbackRequest } from '@/types/callback';
import { Paginated } from '@/types/api';
import { mockCallbacks, shouldUseMock } from './_mock';

export const callbacksApi = {
  async list(): Promise<Callback[]> {
    try {
      const { data } = await axiosClient.get<Callback[] | Paginated<Callback>>(
        endpoints.callbacks.list,
      );
      return Array.isArray(data) ? data : data.results;
    } catch (e) {
      if (shouldUseMock(e)) return mockCallbacks;
      throw e;
    }
  },

  async create(body: CreateCallbackRequest): Promise<Callback> {
    const { data } = await axiosClient.post<Callback>(endpoints.callbacks.list, body);
    return data;
  },

  async update(id: number, patch: Partial<Callback>): Promise<Callback> {
    const { data } = await axiosClient.patch<Callback>(endpoints.callbacks.detail(id), patch);
    return data;
  },
};
