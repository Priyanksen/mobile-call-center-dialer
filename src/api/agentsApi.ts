import { axiosClient } from './axiosClient';
import { endpoints } from './endpoints';
import { Agent, AgentStats, AgentStatus } from '@/types/agent';
import { mockAgent, mockStats, shouldUseMock } from './_mock';

export const agentsApi = {
  async me(): Promise<Agent> {
    try {
      const { data } = await axiosClient.get<Agent>(endpoints.agent.me);
      return data;
    } catch (e) {
      if (shouldUseMock(e)) return mockAgent;
      throw e;
    }
  },

  async updateStatus(status: AgentStatus): Promise<Agent> {
    const { data } = await axiosClient.patch<Agent>(endpoints.agent.status, { status });
    return data;
  },

  async stats(): Promise<AgentStats> {
    try {
      const { data } = await axiosClient.get<AgentStats>(endpoints.agent.stats);
      return data;
    } catch (e) {
      if (shouldUseMock(e)) return mockStats;
      throw e;
    }
  },

  async update(patch: Partial<Agent>): Promise<Agent> {
    const { data } = await axiosClient.patch<Agent>(endpoints.agent.me, patch);
    return data;
  },
};
