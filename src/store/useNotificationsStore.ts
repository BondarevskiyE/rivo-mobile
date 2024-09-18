import {create} from 'zustand';

import {RemoteMessage} from '@/shared/types/notification';

type Notification = RemoteMessage;

interface NotificationsStore {
  notifications: Notification[];
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  fetchNotifications: () => void;
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const notificationsMock = [
  {
    data: {},
    sentTime: 1726481239214,
    from: '235832681635',
    messageId: '1726231555062341',
    notification: {
      body: 'You have just implement push notification have just implement push notification',
      title: 'Congratulations!!',
    },
  },

  {
    data: {},
    sentTime: 1716239187997,
    from: '235832681635',
    messageId: '17262315562341',
    notification: {
      body: 'Some information',
      title: 'sdf!!',
    },
  },
  {
    data: {},
    sentTime: 1426239187997,
    from: '235832681635',
    messageId: '17231555062341',
    notification: {
      body: 'You have just implement push notification have just implement push notification',
      title: 'hello!!',
    },
  },
];

export const useNotificationsStore = create<NotificationsStore>()(
  (set, get) => ({
    notifications: [],
    isLoading: false,
    setIsLoading: (isLoading: boolean) => set({isLoading: isLoading}),

    fetchNotifications: async () => {
      set({isLoading: true});
      set({notifications: notificationsMock});
      set({isLoading: false});
    },
    addNotification: (notification: Notification) => {
      set({notifications: [...get().notifications, notification]});
    },
    markNotificationAsRead: async (id: string) => {
      console.log(id);
    },
    markAllAsRead: async () => {
      const markNotificationAsRead = get().markNotificationAsRead;
      const notifications = get().notifications;

      await Promise.all(
        notifications.map(async notification => {
          notification.messageId &&
            (await markNotificationAsRead(notification.messageId));
        }),
      );
    },
  }),
);
