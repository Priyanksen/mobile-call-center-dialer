import { create } from 'zustand';
import { Call, CallInitiateRequest, CallStatus } from '@/types/call';
import { callsApi } from '@/api/callsApi';

interface CallState {
  active: Call | null;
  status: CallStatus | null;
  duration: number;
  initiating: boolean;
  error: string | null;

  initiate: (req: CallInitiateRequest, meta?: Partial<Call>) => Promise<Call>;
  applyStatus: (s: CallStatus, duration?: number) => void;
  hangup: () => Promise<void>;
  clear: () => void;
}

export const useCallStore = create<CallState>((set, get) => ({
  active: null,
  status: null,
  duration: 0,
  initiating: false,
  error: null,

  initiate: async (req, meta) => {
    set({ initiating: true, error: null, duration: 0 });
    try {
      const call = await callsApi.initiate(req);
      const merged: Call = { ...call, ...meta, ...call };
      set({ active: merged, status: call.status ?? 'initiating', initiating: false });
      return merged;
    } catch (e) {
      set({ initiating: false, error: (e as Error).message });
      throw e;
    }
  },

  applyStatus: (s, duration) => {
    set({ status: s, duration: duration ?? get().duration });
  },

  hangup: async () => {
    const a = get().active;
    if (!a) return;
    try {
      await callsApi.hangup(a.call_id);
    } finally {
      set({ status: 'completed' });
    }
  },

  clear: () => set({ active: null, status: null, duration: 0, error: null }),
}));
