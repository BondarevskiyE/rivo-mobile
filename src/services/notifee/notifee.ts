import {useSettingsStore} from '@/store/useSettingsStore';
import notifee, {
  AndroidAction,
  AuthorizationStatus,
  EventType,
} from '@notifee/react-native';

export const createBackgroundEventNotificationsHandler = () => {
  return notifee.onBackgroundEvent(async ({type, detail}) => {
    const {notification, pressAction} = detail;
    if (
      notification?.id &&
      type === EventType.PRESS &&
      pressAction?.id === 'default'
    ) {
      await notifee.cancelNotification(notification.id);
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
        console.log('User pressed notification', detail.notification);
        break;
    }
  });
};

export const checkNotificationPermissions = async () => {
  const setIsNotificationsDetermined =
    useSettingsStore.getState().setIsNotificationsDetermined;
  const setIsNotificationsEnabled =
    useSettingsStore.getState().setIsNotificationsEnabled;
  try {
    const permissions = await notifee.getNotificationSettings();

    // true if it is the first user entering
    const isFirstEntering =
      permissions.authorizationStatus === AuthorizationStatus.NOT_DETERMINED;

    if (!isFirstEntering) {
      setIsNotificationsDetermined(true);
    }

    if (permissions.authorizationStatus === AuthorizationStatus.AUTHORIZED) {
      setIsNotificationsEnabled(true);
    }
    if (permissions.authorizationStatus === AuthorizationStatus.DENIED) {
      setIsNotificationsEnabled(false);
    }
  } catch {
    console.log('checkNotificationPermissions error');
  }
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
