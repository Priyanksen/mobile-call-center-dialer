import { axiosClient } from './axiosClient';
import { endpoints } from './endpoints';
import { AppNotification } from '@/types/notification';
import { Paginated } from '@/types/api';
import { mockNotifications, shouldUseMock } from './_mock';

export const notificationsApi = {
  async list(): Promise<AppNotification[]> {
    try {
      const { data } = await axiosClient.get<AppNotification[] | Paginated<AppNotification>>(
        endpoints.notifications.list,
      );
      return Array.isArray(data) ? data : data.results;
    } catch (e) {
      if (shouldUseMock(e)) return mockNotifications;
      throw e;
    }
  },

  async markRead(id: number): Promise<void> {
    await axiosClient.patch(endpoints.notifications.read(id));
  },
};
