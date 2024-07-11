import React, {useState} from 'react';
import {View, StyleSheet, Text, Alert} from 'react-native';

import {Colors, Fonts} from '@/shared/ui';
import {useLoginStore} from '@/store/useLoginStore';
import {useUserStore} from '@/store/useUserStore';
import {PasswordKeyboard, AsyncAlert} from '@/components';
import {PINCODE_LENGTH} from '@/shared/constants';
import {
  saveCredentialsWithBiometry,
  saveCredentialsWithPassword,
  getBiometrySupportedType,
} from '@/services/keychain';
import {useSettingsStore} from '@/store/useSettingsStore';
import {AuthStackProps, AUTH_SCREENS} from '@/navigation/AuthStack';
import {StackScreenProps} from '@react-navigation/stack';

type Props = StackScreenProps<
  AuthStackProps,
  AUTH_SCREENS.PASS_CODE_REGISTRATION
>;

export const PassCodeRegistrationScreen: React.FC<Props> = ({navigation}) => {
  const [storedPassCode, setStoredPassCode] = useState<string>('');
  const [isRepeating, setIsRepeating] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const user = useUserStore(state => state.userInfo);

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
            navigation.navigate(AUTH_SCREENS.LOGIN);
          },
        },
      ]);
      return;
    }

    const isPassCodesMatch = pinCode === storedPassCode;

    if (isPassCodesMatch) {
      const biometryType = await getBiometrySupportedType();

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
      navigation.navigate(AUTH_SCREENS.ENABLE_NOTIFICATIONS);
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
    fontFamily: Fonts.bold,
    lineHeight: 33.6,
    textAlign: 'center',
    marginTop: 60,
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
