import React from 'react';
import {RESULTS} from 'react-native-permissions';
import {StyleSheet, Text, View, Dimensions, Image, Alert} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {Colors, Fonts, Images} from '@/shared/ui';
import {Button} from '@/components';
import {BUTTON_TYPE} from '@/components/general/Button/Button';
import {useSettingsStore} from '@/store/useSettingsStore';
import {useUserStore} from '@/store/useUserStore';
import {StackScreenProps} from '@react-navigation/stack';
import {AUTH_SCREENS, AuthStackProps} from '@/navigation/types/authStack';
import {EPermissionTypes, usePermissions} from '@/shared/hooks/usePermissions';

type Props = StackScreenProps<
  AuthStackProps,
  AUTH_SCREENS.ENABLE_NOTIFICATIONS
>;

const {width} = Dimensions.get('screen');

export const EnableNotificationsScreen: React.FC<Props> = () => {
  const setIsNotificationsEnabled = useSettingsStore(
    state => state.setIsNotificationsEnabled,
  );

  const setIsloggedIn = useUserStore(state => state.setIsLoggedIn);

  const {askPermissions} = usePermissions(EPermissionTypes.PUSH_NOTIFICATIONS);

  const onClickEnableNotifications = async () => {
    askPermissions()
      .then(status => {
        if (
          status.type === RESULTS.LIMITED ||
          status.type === RESULTS.GRANTED
        ) {
          // turn on internal state isNotificationsEnabled
          setIsNotificationsEnabled(true);
        }
      })
      .catch(error => {
        if ('isError' in error && error.isError) {
          Alert.alert(
            error.errorMessage ||
              'Something went wrong while taking notifications permission',
          );
        }
        if ('type' in error) {
          if (error.type === RESULTS.BLOCKED || error.type === RESULTS.DENIED) {
            // turn off internal state isNotificationsEnabled if it not the first entering
            setIsNotificationsEnabled(false);
          }
        }
      })
      .finally(() => {
        // pass the user in the app in any way
        setIsloggedIn(true);
      });
  };

  const onFinishRegistration = () => {
    setIsloggedIn(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Turn on useful notifications</Text>
      <View style={styles.imageContainer}>
        <Image
          source={Images.enableNotifications}
          style={styles.image}
          resizeMode="contain"
        />
        <LinearGradient
          colors={['rgba(238, 238, 238, 0)', '#EEEEEE']}
          locations={[0, 0.6]}
          style={styles.gradient}
        />
      </View>
      <View style={styles.buttonsContainer}>
        <Button
          text="Enable notifications"
          onPress={onClickEnableNotifications}
          style={styles.firstButton}
        />
        <Button
          text="Not now"
          onPress={onFinishRegistration}
          type={BUTTON_TYPE.SECONDARY}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ui_background,
    paddingHorizontal: 12,
    paddingTop: 56,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    paddingHorizontal: 30,
    textAlign: 'center',
    marginBottom: 65,
  },
  imageContainer: {
    position: 'relative',
    top: 50,
    flex: 1,
    width,
  },
  image: {
    flex: 1,
    width,
    transform: [{scale: 1.2}],
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    height: 300,
    width,
  },
  buttonsContainer: {
    width: '100%',
  },
  firstButton: {
    marginBottom: 8,
  },
});
