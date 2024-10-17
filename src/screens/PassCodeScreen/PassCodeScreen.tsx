import React, {useEffect, useMemo, useState} from 'react';
import {View, StyleSheet, Text, Image} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {Colors, Fonts} from '@/shared/ui';
import {useLoginStore} from '@/store/useLoginStore';
import {useUserStore} from '@/store/useUserStore';
import {PasswordKeyboard} from '@/components';
import {PINCODE_LENGTH} from '@/shared/constants';
import {AsyncAlert} from '@/components';
import {
  getCredentialsWithBiometry,
  getCredentialsWithPassword,
} from '@/services/keychain';
import {useSettingsStore} from '@/store/useSettingsStore';
import {useAppState} from '@/shared/hooks';

export const PassCodeScreen: React.FC = () => {
  const [isError, setIsError] = useState<boolean>(false);
  const [isBiometryTried, setIsBiometryTried] = useState<boolean>(false);

  const user = useUserStore(state => state.userInfo);

  const setIsLoggedIn = useLoginStore(state => state.setIsLoggedIn);

  const logout = useLoginStore(state => state.logout);

  const isBiometryEnabled = useSettingsStore(state => state.isBiometryEnabled);

  const setIsPassCodeEntered = useLoginStore(
    state => state.setIsPassCodeEntered,
  );

  const {appState} = useAppState({
    onBackground: () => {
      // reset state when the user collapse the app
      setIsBiometryTried(false);
    },
  });

  const getHideErrorCallback = () => {
    let timeout: NodeJS.Timeout;

    return (timeoutTime?: number) => {
      if (timeoutTime) {
        timeout = setTimeout(() => {
          setIsError(false);
        }, timeoutTime);
        return;
      }

      clearInterval(timeout);
      setIsError(false);
    };
  };

  const hideError = useMemo(() => getHideErrorCallback(), []);

  const onPinCodeFulfilled = async (pinCode: string) => {
    const credentials = await getCredentialsWithPassword();

    // if we can't get passcode we return the user to auth screen
    if (!credentials) {
      setIsLoggedIn(false);
      return;
    }

    const isPassCodesMatch = pinCode === credentials?.password;

    if (isPassCodesMatch) {
      setIsPassCodeEntered(true);
      return;
    }

    setIsError(true);

    hideError(1500);
  };

  const onClickBiometry = async () => {
    const credentials = await getCredentialsWithBiometry();

    if (credentials) {
      setIsPassCodeEntered(true);
    }
  };

  const onExit = async () => {
    const isUserConfirmed = await AsyncAlert({
      title: 'Are you sure you want to exit?',
      resolveButtonText: 'Exit',
      rejectButtonText: 'No',
    });
    if (isUserConfirmed) {
      logout();
    }
  };

  useEffect(() => {
    // if user open the app after collapsing we need to try to pass with biometry if it is enabled
    // isBiometryTried is true only if user already tried to pass
    // appState === 'active' only when user open the app after collapsing
    if (isBiometryEnabled && appState === 'active' && !isBiometryTried) {
      onClickBiometry();
      setIsBiometryTried(true);
    }
  }, [appState]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.avatarContainer}>
        {user?.photo ? (
          <Image
            source={{
              uri: user?.photo,
            }}
            style={styles.avatar}
          />
        ) : (
          <View
            style={[styles.avatar, {backgroundColor: Colors.ui_beige_30}]}
          />
        )}
      </View>
      <Text style={styles.title}>Enter your pin code</Text>

      <PasswordKeyboard
        onPinCodeFulfilled={onPinCodeFulfilled}
        onClickBiometry={isBiometryEnabled ? onClickBiometry : undefined}
        onExit={onExit}
        isError={isError}
        pinCodeLength={PINCODE_LENGTH}
        hideError={hideError}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flex: 1,
    backgroundColor: Colors.ui_background,
    paddingHorizontal: 25,
    paddingTop: 50,
  },
  avatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  title: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    lineHeight: 33.6,
    textAlign: 'center',
    color: Colors.ui_black,
  },
  errorText: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    marginTop: 12,
    color: Colors.error_red,
  },
  lowerBlock: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 24,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  dot: {
    borderRadius: 22,
    backgroundColor: 'black',
  },
});
