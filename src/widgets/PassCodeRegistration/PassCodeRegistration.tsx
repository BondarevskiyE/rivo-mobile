import React, {useState} from 'react';
import {View, StyleSheet, Text, Alert} from 'react-native';

import {Colors, Fonts} from '@/shared/ui';
import {LOGIN_STEPS, useLoginStore} from '@/store/useLoginStore';
import {useUserStore} from '@/store/useUserStore';
import {PasswordKeyboard} from '@/entities/PasswordKeyboard';
import {AsyncAlert} from '@/shared/ui/components';
import {PINCODE_LENGTH} from '@/shared/constants';
import {
  saveCredentialsWithBiometry,
  saveCredentialsWithPassword,
  isBiometrySupportedType,
} from '@/shared/lib/keychain';
import {useSettingsStore} from '@/store/useSettingsStore';

export const PassCodeRegistration: React.FC = () => {
  const [storedPassCode, setStoredPassCode] = useState<string>('');
  const [isRepeating, setIsRepeating] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const user = useUserStore(state => state.userInfo);

  const setLoginStep = useLoginStore(state => state.setLoginStep);
  const setIsloggedIn = useUserStore(state => state.setIsLoggedIn);
  const setIsPassCodeEntered = useLoginStore(
    state => state.setIsPassCodeEntered,
  );
  const setIsBiometryEnabled = useSettingsStore(
    state => state.setIsBiometryEnabled,
  );

  const onPinCodeFulfilled = async (pinCode: string) => {
    if (!isRepeating) {
      setStoredPassCode(pinCode);
      setIsRepeating(true);
      return;
    }

    // unachievable, here just for ocassion when user cannot sign up
    if (!user?.email) {
      Alert.alert('login error', 'You need to login again', [
        {
          text: 'OK',
          onPress: () => {
            setLoginStep(LOGIN_STEPS.AUTH);
          },
        },
      ]);
      return;
    }

    const isPassCodesMatch = pinCode === storedPassCode;

    if (isPassCodesMatch) {
      const biometryType = await isBiometrySupportedType();

      if (biometryType) {
        const isBiometryEnabled = await AsyncAlert({
          title: `Enable ${biometryType}?`,
          message: 'Short and complete sentence',
          resolveButtonText: 'Allow',
          rejectButtonText: "Don't Allow",
        });

        setIsBiometryEnabled(isBiometryEnabled);

        isBiometryEnabled &&
          (await saveCredentialsWithBiometry(user?.email, pinCode));
      }
      await saveCredentialsWithPassword(user?.email, pinCode);
      setIsloggedIn(true);
      setLoginStep(LOGIN_STEPS.NONE);
      setIsPassCodeEntered(true);
      return;
    }

    setIsError(true);

    setTimeout(() => {
      setIsError(false);
    }, 1500);
  };

  const titleText = isRepeating
    ? 'Repeat your passcode'
    : 'Now let’s set up a passcode';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{titleText}</Text>

      <PasswordKeyboard
        onPinCodeFulfilled={onPinCodeFulfilled}
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
  },
  title: {
    fontSize: 28,
    height: 68,
    fontFamily: Fonts.extraBold,
    lineHeight: 33.6,
    textAlign: 'center',
    marginTop: 60,
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
