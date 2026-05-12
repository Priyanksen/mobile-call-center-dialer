import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useAgentStore } from '@/store/agentStore';
import { AgentStatus } from '@/types/agent';

export function useAgentStatus() {
  const agent = useAgentStore((s) => s.agent);
  const setStatus = useAgentStore((s) => s.setStatus);

  const change = useCallback(
    async (status: AgentStatus) => {
      try {
        await setStatus(status);
      } catch {
        Alert.alert('Status update failed', 'Please try again.');
      }
    },
    [setStatus],
  );

  return { status: agent?.status ?? 'offline', change };
}
