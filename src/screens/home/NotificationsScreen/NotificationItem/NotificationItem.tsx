import {Dimensions, Pressable, StyleSheet, Text, View} from 'react-native';

import {Colors, Fonts} from '@/shared/ui';
import {RemoteMessage} from '@/shared/types/notification';
import {BellIcon} from '@/shared/ui/icons';
import {SCREEN_HORIZONTAL_PADDING} from '../NotificationsScreen';
import {getTimeString} from './helpers';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const NOTIFICATION_WIDTH = SCREEN_WIDTH - SCREEN_HORIZONTAL_PADDING * 2;

interface Props {
  message: RemoteMessage;
}

export const NotificationItem: React.FC<Props> = ({message}) => {
  const time = getTimeString(message.sentTime || 0);

  const handleOpenNotificationModal = () => {
    console.log(message);
  };

  return (
    <Pressable onPress={handleOpenNotificationModal} style={styles.container}>
      <View style={styles.iconContainer}>
        <BellIcon color={Colors.ui_orange_80} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.titleText}>{message.notification?.title}</Text>
        <Text style={styles.bodyText}>{message.notification?.body}</Text>
      </View>
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{time}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: Colors.ui_white,
    borderRadius: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    width: NOTIFICATION_WIDTH,
    marginBottom: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.ui_orange_20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    justifyContent: 'space-between',
    flexGrow: 1,
    maxWidth: NOTIFICATION_WIDTH - 125,
  },
  titleText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: Colors.ui_black_80,
  },
  bodyText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.ui_grey_70,
  },
  timeContainer: {
    height: '100%',
    alignItems: 'flex-start',
  },
  timeText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.ui_grey_70,
  },
});
