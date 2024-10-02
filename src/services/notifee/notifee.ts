import notifee, {AndroidAction, EventType} from '@notifee/react-native';
import {openLink} from '@/shared/lib/utilities';

export const createBackgroundEventNotificationsHandler = () => {
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
        const link = `${detail.notification?.data?.link}`;
        if (link) {
          openLink(link);
        }
        console.log('User pressed notification', detail.notification);
        break;
    }
  });
};
interface DisplayNotificationsParams {
  title: string;
  body: string;
  channelId: string;
  id?: string;
  androidActions?: AndroidAction[];
}

export const displayNotification = async ({
  title,
  body,
  id,
  channelId,
  androidActions,
}: DisplayNotificationsParams) => {
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
