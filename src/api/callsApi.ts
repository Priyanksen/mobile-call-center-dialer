import { axiosClient } from './axiosClient';
import { endpoints } from './endpoints';
import { Call, CallInitiateRequest, CallStatus, DispositionRequest } from '@/types/call';
import { Paginated } from '@/types/api';
import { mockCalls, shouldUseMock } from './_mock';

export const callsApi = {
  async initiate(body: CallInitiateRequest): Promise<Call> {
    const { data } = await axiosClient.post<Call>(endpoints.calls.initiate, body);
    return data;
  },

  async hangup(call_id: string): Promise<{ success: boolean }> {
    const { data } = await axiosClient.post<{ success: boolean }>(endpoints.calls.hangup, {
      call_id,
    });
    return data;
  },

  async disposition(body: DispositionRequest): Promise<{ success: boolean }> {
    const { data } = await axiosClient.post<{ success: boolean }>(
      endpoints.calls.disposition,
      body,
    );
    return data;
  },

  async status(call_id: string): Promise<{ status: CallStatus; duration?: number }> {
    const { data } = await axiosClient.get<{ status: CallStatus; duration?: number }>(
      endpoints.calls.status(call_id),
    );
    return data;
  },

  async detail(call_id: string): Promise<Call> {
    const { data } = await axiosClient.get<Call>(endpoints.calls.detail(call_id));
    return data;
  },

  async list(params?: Record<string, string | number>): Promise<Call[]> {
    try {
      const { data } = await axiosClient.get<Call[] | Paginated<Call>>(endpoints.calls.list, {
        params,
      });
      return Array.isArray(data) ? data : data.results;
    } catch (e) {
      if (shouldUseMock(e)) return mockCalls;
      throw e;
    }
  },
};
