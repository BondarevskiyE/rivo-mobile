import notifee, {AuthorizationStatus} from '@notifee/react-native';
import {StyleSheet, Text, View, Dimensions, Image, Linking} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {Colors, Fonts, Images} from '@/shared/ui';
import {Button} from '@/shared/ui/components';
import {ButtonType} from '@/shared/ui/components/Button/Button';
import React, {useState} from 'react';
import {useSettingsStore} from '@/store/useSettingsStore';
import {useUserStore} from '@/store/useUserStore';
import {LOGIN_STEPS, useLoginStore} from '@/store/useLoginStore';

const {width} = Dimensions.get('screen');

export const EnableNotifications = () => {
  const [isUserClickedButton, setIsUserClickedButton] =
    useState<boolean>(false);

  const setIsNotificationsEnabled = useSettingsStore(
    state => state.setIsNotificationsEnabled,
  );

  const setIsloggedIn = useUserStore(state => state.setIsLoggedIn);

  const setLoginStep = useLoginStore(state => state.setLoginStep);

  const onClickEnableNotifications = async () => {
    !isUserClickedButton && setIsUserClickedButton(true);

    const notificationsPermisions = await notifee.requestPermission();

    if (
      notificationsPermisions.authorizationStatus ===
      AuthorizationStatus.AUTHORIZED
    ) {
      setIsNotificationsEnabled(true);
    }

    // if user rejected enabling notifications in the first time we need to redirect them to settings app
    if (
      notificationsPermisions.authorizationStatus ===
        AuthorizationStatus.DENIED &&
      isUserClickedButton
    ) {
      Linking.openURL('app-settings:');
      return;
    }
    setIsloggedIn(true);
    setLoginStep(LOGIN_STEPS.NONE);
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
    fontFamily: Fonts.extraBold,
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
