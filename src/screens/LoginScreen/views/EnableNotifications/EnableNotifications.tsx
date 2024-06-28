import notifee, {AuthorizationStatus} from '@notifee/react-native';
import {StyleSheet, Text, View, Dimensions, Image} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {Colors, Fonts, Images} from '@/shared/ui';
import {Button} from '@/components';
import {ButtonType} from '@/components/general/Button/Button';
import React, {useEffect} from 'react';
import {useSettingsStore} from '@/store/useSettingsStore';
import {useUserStore} from '@/store/useUserStore';
import {LOGIN_STEPS, useLoginStore} from '@/store/useLoginStore';
import {useIsMounted} from '@/shared/hooks';

const {width} = Dimensions.get('screen');

export const EnableNotifications = () => {
  const isMounted = useIsMounted();

  const setIsNotificationsEnabled = useSettingsStore(
    state => state.setIsNotificationsEnabled,
  );

  const setIsloggedIn = useUserStore(state => state.setIsLoggedIn);

  const setLoginStep = useLoginStore(state => state.setLoginStep);

  const onClickEnableNotifications = async () => {
    const notificationsPermisions = await notifee.requestPermission();

    const isAuthorized =
      notificationsPermisions.authorizationStatus ===
      AuthorizationStatus.AUTHORIZED;

    if (isAuthorized) {
      setIsNotificationsEnabled(true);
    }

    setIsloggedIn(true);
    setLoginStep(LOGIN_STEPS.NONE);
  };

  const onFinishRegistration = () => {
    setIsloggedIn(true);
  };

  const checkPermissions = async () => {
    const permissions = await notifee.getNotificationSettings();

    // true if it is the first user entering
    const isFirstEntering =
      permissions.authorizationStatus === AuthorizationStatus.NOT_DETERMINED;

    if (permissions.authorizationStatus === AuthorizationStatus.AUTHORIZED) {
      setIsNotificationsEnabled(true);
    }

    if (!isFirstEntering) {
      setIsloggedIn(true);
      setLoginStep(LOGIN_STEPS.NONE);
    }
  };

  useEffect(() => {
    // if the uses has already authorized permissions we pass them to the homescreen
    checkPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isMounted) {
    return null;
  }

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
        />
        <Button
          text="Not now"
          onPress={onFinishRegistration}
          type={ButtonType.SECONDARY}
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
});
