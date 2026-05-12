import { create } from 'zustand';
import { Agent, AgentStats, AgentStatus } from '@/types/agent';
import { agentsApi } from '@/api/agentsApi';
import { ENV } from '@/config/env';

interface AgentState {
  agent: Agent | null;
  stats: AgentStats | null;
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  refreshStats: () => Promise<void>;
  setStatus: (s: AgentStatus) => Promise<void>;
  updateProfile: (patch: Partial<Agent>) => Promise<void>;
  reset: () => void;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  agent: null,
  stats: null,
  loading: false,
  error: null,

  load: async () => {
    set({ loading: true, error: null });
    try {
      const [agent, stats] = await Promise.all([agentsApi.me(), agentsApi.stats()]);
      set({ agent, stats, loading: false });
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
    }
  },

  refreshStats: async () => {
    try {
      const stats = await agentsApi.stats();
      set({ stats });
    } catch {
      // silent
    }
  },

  updateProfile: async (patch) => {
    const prev = get().agent;
    try {
      const updated = await agentsApi.update(patch);
      set({ agent: updated });
    } catch (e) {
      const err = e as { response?: { status?: number } };
      const isNetworkError = !err.response;
      if (ENV.USE_MOCK_FALLBACK && isNetworkError && prev) {
        set({ agent: { ...prev, ...patch } });
        return;
      }
      throw e;
    }
  },

  setStatus: async (status) => {
    const prev = get().agent;
    if (prev) set({ agent: { ...prev, status } });
    try {
      const updated = await agentsApi.updateStatus(status);
      set({ agent: updated });
    } catch (e) {
      const err = e as { response?: { status?: number } };
      const isNetworkError = !err.response;
      if (ENV.USE_MOCK_FALLBACK && isNetworkError) {
        return;
      }
      if (prev) set({ agent: prev });
      throw e;
    }
  },

  reset: () => set({ agent: null, stats: null, error: null }),
}));
