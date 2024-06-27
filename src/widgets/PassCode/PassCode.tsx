import React, {useState} from 'react';
import {View, StyleSheet, Text, Image} from 'react-native';

import {Colors, Fonts} from '@/shared/ui';
import {LOGIN_STEPS, useLoginStore} from '@/store/useLoginStore';
import {useUserStore} from '@/store/useUserStore';
import {PasswordKeyboard} from '@/entities/PasswordKeyboard';
import {PINCODE_LENGTH} from '@/shared/constants';
import {AsyncAlert} from '@/shared/ui/components';
import {
  getCredentialsWithBiometry,
  getCredentialsWithPassword,
} from '@/shared/lib/keychain';
import {useSettingsStore} from '@/store/useSettingsStore';

export const PassCode: React.FC = () => {
  const [isError, setIsError] = useState<boolean>(false);

  const user = useUserStore(state => state.userInfo);

  const setLoginStep = useLoginStore(state => state.setLoginStep);
  const setIsLoggedIn = useUserStore(state => state.setIsLoggedIn);
  const logout = useLoginStore(state => state.logout);
  const isBiometryEnabled = useSettingsStore(state => state.isBiometryEnabled);

  const setIsPassCodeEntered = useLoginStore(
    state => state.setIsPassCodeEntered,
  );

  const onPinCodeFulfilled = async (pinCode: string) => {
    const credentials = await getCredentialsWithPassword();

    // if we can't get passcode we return the user to auth screen
    if (!credentials) {
      setIsLoggedIn(false);
      setLoginStep(LOGIN_STEPS.AUTH);
      return;
    }

    const isPassCodesMatch = pinCode === credentials?.password;

    if (isPassCodesMatch) {
      setIsPassCodeEntered(true);
      return;
    }

    setIsError(true);

    setTimeout(() => {
      setIsError(false);
    }, 1500);
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

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Image
          source={{
            uri: user?.photo || '',
          }}
          style={styles.avatar}
        />
      </View>
      <Text style={styles.title}>Enter your pin code</Text>

      <PasswordKeyboard
        onPinCodeFulfilled={onPinCodeFulfilled}
        onClickBiometry={isBiometryEnabled ? onClickBiometry : undefined}
        onExit={onExit}
        isError={isError}
        pinCodeLength={PINCODE_LENGTH}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
    fontFamily: Fonts.extraBold,
    lineHeight: 33.6,
    textAlign: 'center',
  },
  errorText: {
    fontFamily: Fonts.bold,
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
