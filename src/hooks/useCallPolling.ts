import { useEffect, useRef } from 'react';
import { callsApi } from '@/api/callsApi';
import { useCallStore } from '@/store/callStore';
import { ENV } from '@/config/env';
import { CallStatus } from '@/types/call';

const TERMINAL: CallStatus[] = ['completed', 'failed', 'busy', 'no_answer'];

export function useCallPolling(call_id: string | null | undefined) {
  const apply = useCallStore((s) => s.applyStatus);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!call_id) return;
    let cancelled = false;

    const tick = async () => {
      try {
        const r = await callsApi.status(call_id);
        if (cancelled) return;
        apply(r.status, r.duration);
        if (TERMINAL.includes(r.status) && timer.current) {
          clearInterval(timer.current);
          timer.current = null;
        }
      } catch {
        // keep polling on error
      }
    };

    void tick();
    timer.current = setInterval(tick, ENV.CALL_POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (timer.current) clearInterval(timer.current);
      timer.current = null;
    };
  }, [call_id, apply]);
}
