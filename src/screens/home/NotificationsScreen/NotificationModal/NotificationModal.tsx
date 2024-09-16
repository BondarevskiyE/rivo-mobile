import {Button} from '@/components';
import {BUTTON_TYPE} from '@/components/general/Button/Button';
import Modal from '@/modal-manager';
import {WhiteInfoModal} from '@/modal-manager/templates/WhiteInfoModal';
import {RemoteMessage} from '@/shared/types/notification';
import {Colors, Fonts} from '@/shared/ui';
import {StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export const openNotificationModal = (message: RemoteMessage) => {
  Modal.show({
    children: <NotificationModal message={message} />,
    dismissable: true,
    position: 'bottom',
  });
};

interface Props {
  message: RemoteMessage;
}

export const NotificationModal: React.FC<Props> = ({message}) => {
  return (
    <WhiteInfoModal height={445}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 1)', 'rgba(238, 231, 231, 1)']}
        style={styles.container}>
        <View>
          <Text style={styles.title}>{message.notification?.title}</Text>

          <Text style={styles.text}>{message.notification?.body}</Text>
        </View>
        <Button
          text="Open"
          onPress={console.log}
          style={styles.button}
          textStyle={styles.buttonText}
          type={BUTTON_TYPE.ACTION_SECONDARY}
        />
      </LinearGradient>
    </WhiteInfoModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingBottom: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: 20,
    color: Colors.ui_black_80,

    marginBottom: 8,
  },

  text: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.ui_grey_715,
  },
  button: {
    height: 56,
    borderRadius: 28,
  },
  buttonText: {
    fontFamily: Fonts.bold,
    fontSize: 17,
  },
});
