import notifee, {AndroidAction, EventType} from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';

import {openNotificationLink} from '@/shared/lib/utilities';

export const registerBackgroundService = () => {
  return notifee.onBackgroundEvent(async ({type, detail}) => {
    const {notification, pressAction} = detail;
    console.log('detail: ', detail);
    if (
      notification?.id &&
      type === EventType.PRESS &&
      pressAction?.id === 'default'
    ) {
      // await notifee.cancelNotification(notification.id);
    }
  });
};

export const registerForegroundService = () => {
  return notifee.onForegroundEvent(({type, detail}) => {
    switch (type) {
      case EventType.DISMISSED:
        console.log('User dismissed notification', detail.notification);
        break;
      case EventType.PRESS:
        if (detail.notification?.data?.deep_link) {
          openNotificationLink(`${detail.notification?.data?.deep_link}`);
        } else {
          openNotificationLink('tabs/notifications');
        }
        console.log('User pressed notification', detail.notification);
        break;
    }
  });
};

export const checkInitialNotification = async () => {
  const initialNotification = await messaging().getInitialNotification();

  if (initialNotification) {
    const link = `${initialNotification?.data?.deep_link}`;

    if (link) {
      openNotificationLink(link);
    }
  }
};
interface DisplayNotificationsParams {
  title?: string;
  body?: string;
  id?: string;
  androidActions?: AndroidAction[];
}

export const displayNotification = async ({
  title = '',
  body = '',
  id,
  androidActions,
}: DisplayNotificationsParams) => {
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
  });

  const pressAction = id
    ? {
        id,
      }
    : undefined;

  const actions = androidActions?.length ? androidActions : undefined;

  return await notifee.displayNotification({
    title,
    body,
    android: {
      channelId,
      pressAction,
      actions,
    },
  });
};
