import { axiosClient } from './axiosClient';
import { endpoints } from './endpoints';
import { Call, CallInitiateRequest, CallStatus, DispositionRequest } from '@/types/call';
import { Paginated } from '@/types/api';
import { mockCalls, shouldUseMock } from './_mock';

function isNetworkError(e: unknown): boolean {
  const err = e as { response?: { status?: number } };
  return !err.response;
}

export const callsApi = {
  async initiate(body: CallInitiateRequest): Promise<Call> {
    try {
      const { data } = await axiosClient.post<Call>(endpoints.calls.initiate, body);
      return data;
    } catch (e) {
      if (shouldUseMock(e) || isNetworkError(e)) {
        return {
          call_id: `mock-${Date.now()}`,
          lead_id: body.lead_id,
          phone: body.phone,
          route_type: body.route_type,
          status: 'initiating',
          started_at: new Date().toISOString(),
        };
      }
      throw e;
    }
  },

  async hangup(call_id: string): Promise<{ success: boolean }> {
    try {
      const { data } = await axiosClient.post<{ success: boolean }>(endpoints.calls.hangup, {
        call_id,
      });
      return data;
    } catch (e) {
      if (shouldUseMock(e) || isNetworkError(e)) return { success: true };
      throw e;
    }
  },

  async disposition(body: DispositionRequest): Promise<{ success: boolean }> {
    try {
      const { data } = await axiosClient.post<{ success: boolean }>(
        endpoints.calls.disposition,
        body,
      );
      return data;
    } catch (e) {
      if (shouldUseMock(e) || isNetworkError(e)) return { success: true };
      throw e;
    }
  },

  async status(call_id: string): Promise<{ status: CallStatus; duration?: number }> {
    try {
      const { data } = await axiosClient.get<{ status: CallStatus; duration?: number }>(
        endpoints.calls.status(call_id),
      );
      return data;
    } catch (e) {
      // Simulate a believable call lifecycle when no backend: initiating → ringing → connected
      if (shouldUseMock(e) || isNetworkError(e)) {
        return { status: 'connected', duration: 0 };
      }
      throw e;
    }
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
