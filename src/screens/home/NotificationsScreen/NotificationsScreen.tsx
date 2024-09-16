import {Dimensions, StyleSheet, Text, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';

import {NotificationItem} from './NotificationItem';
import {createNotificationsMapByDate} from './helpers';
import {Colors, Fonts} from '@/shared/ui';
import {GradientBellIcon} from '@/shared/ui/icons/GradientBellIcon';
// import {RemoteMessage} from '@/shared/types/notification';
import {MarkAsReadButton} from './MarkAsReadButton';
import {useNotificationsStore} from '@/store/useNotificationsStore';
import {Loader} from '@/components/Loader';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

export const SCREEN_HORIZONTAL_PADDING = 12;

export const NotificationsScreen = () => {
  const {notifications, isLoading} = useNotificationsStore(state => ({
    notifications: state.notifications,
    isLoading: state.isLoading,
  }));

  const notificationsMapByDate = createNotificationsMapByDate(notifications);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Loader />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {notifications.length ? (
        <View style={styles.scrollListContainer}>
          <ScrollView
            contentContainerStyle={styles.scrollList}
            showsVerticalScrollIndicator={false}>
            {Object.entries(notificationsMapByDate).map(([date, msgs]) => (
              <View key={date}>
                <Text style={styles.dateText}>{date}</Text>
                {msgs.map(message => (
                  <NotificationItem message={message} key={message.messageId} />
                ))}
              </View>
            ))}
          </ScrollView>
          <MarkAsReadButton />
        </View>
      ) : (
        <View style={styles.emptyScreenContainer}>
          <GradientBellIcon />
          <Text style={styles.emptyScreenText}>No notifications here yet</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
  },
  emptyScreenContainer: {
    paddingTop: 118,
    alignItems: 'center',
  },
  emptyScreenText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: Colors.ui_grey_715,
    marginTop: 18,
  },
  scrollListContainer: {
    position: 'relative',
  },
  scrollList: {
    paddingTop: 26,
    paddingBottom: 90,
  },
  dateText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.ui_grey_70,
    marginLeft: 4,
    marginBottom: 12,
  },
  loadingContainer: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
