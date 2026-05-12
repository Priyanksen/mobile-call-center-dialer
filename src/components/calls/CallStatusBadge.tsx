import React from 'react';
import { CallStatus } from '@/types/call';
import { StatusBadge, callStatusTone } from '@/components/common/StatusBadge';

export function CallStatusBadge({ status }: { status: CallStatus | null }) {
  if (!status) return null;
  return <StatusBadge label={status.replace('_', ' ')} tone={callStatusTone(status)} />;
}
