import React, {useState} from 'react';
import {View, StyleSheet, Text, Alert} from 'react-native';
import {RESULTS} from 'react-native-permissions';

import {Colors, Fonts} from '@/shared/ui';
import {useLoginStore} from '@/store/useLoginStore';
import {useUserStore} from '@/store/useUserStore';
import {PasswordKeyboard} from '@/components';
import {PINCODE_LENGTH} from '@/shared/constants';
import {
  saveCredentialsWithBiometry,
  saveCredentialsWithPassword,
  getBiometrySupportedType,
} from '@/services/keychain';
import {useSettingsStore} from '@/store/useSettingsStore';
import {StackScreenProps} from '@react-navigation/stack';
import {AuthStackProps, AUTH_SCREENS} from '@/navigation/types/authStack';
import {EPermissionTypes, usePermissions} from '@/shared/hooks/usePermissions';
import {getPasscodeFormText} from './helpers';

export enum REGISTER_PASSCODE_STEPS {
  ENTER_PASSCODE,
  REPEAT_PASSCODE,
}

type Props = StackScreenProps<
  AuthStackProps,
  AUTH_SCREENS.PASS_CODE_REGISTRATION
>;

export const PassCodeRegistrationScreen: React.FC<Props> = ({navigation}) => {
  const [storedPassCode, setStoredPassCode] = useState<string>('');

  const [step, setStep] = useState<REGISTER_PASSCODE_STEPS>(
    REGISTER_PASSCODE_STEPS.ENTER_PASSCODE,
  );

  const [attemptCounter, setAttemptCounter] = useState<number>(1);
  const [isError, setIsError] = useState<boolean>(false);

  const user = useUserStore(state => state.userInfo);

  const {setIsPassCodeEntered, setIsLoggedIn} = useLoginStore(state => ({
    setIsPassCodeEntered: state.setIsPassCodeEntered,
    setIsLoggedIn: state.setIsLoggedIn,
  }));
  const {setIsBiometryEnabled, setBiometryType, setIsNotificationsEnabled} =
    useSettingsStore(state => ({
      setIsBiometryEnabled: state.setIsBiometryEnabled,
      setBiometryType: state.setBiometryType,
      setIsNotificationsEnabled: state.setIsNotificationsEnabled,
    }));

  const {askPermissions: askBiometryPermissions} = usePermissions(
    EPermissionTypes.BIOMETRY,
  );

  const {checkPermissions: checkPushNotificationsPermissions} = usePermissions(
    EPermissionTypes.PUSH_NOTIFICATIONS,
  );

  const onRedirectToNextScreen = async () => {
    checkPushNotificationsPermissions()
      .then(response => {
        //permission given for notifications
        if (
          response.type === RESULTS.LIMITED ||
          response.type === RESULTS.GRANTED
        ) {
          setIsNotificationsEnabled(true);
          setIsLoggedIn(true);
        }
      })
      .catch(error => {
        //permission is denied/blocked or camera feature not supported
        if ('isError' in error && error.isError) {
          Alert.alert(
            error.errorMessage ||
              'Something went wrong while checking notifications permission',
          );
          setIsLoggedIn(true);
        }
        if ('type' in error) {
          if (error.type === RESULTS.UNAVAILABLE) {
            Alert.alert('This feature is not supported on this device');
            setIsLoggedIn(true);
            // user blocked permissions, pass them to the app
          } else if (error.type === RESULTS.BLOCKED) {
            setIsLoggedIn(true);
            setIsNotificationsEnabled(false);

            // permissions wasn't asked
          } else if (error.type === RESULTS.DENIED) {
            navigation.navigate(AUTH_SCREENS.ENABLE_NOTIFICATIONS);
          }
        }
      });
  };

  const onPinCodeFulfilled = async (pinCode: string) => {
    switch (step) {
      case REGISTER_PASSCODE_STEPS.ENTER_PASSCODE: {
        setStoredPassCode(pinCode);
        setStep(REGISTER_PASSCODE_STEPS.REPEAT_PASSCODE);
        break;
      }
      case REGISTER_PASSCODE_STEPS.REPEAT_PASSCODE: {
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

        if (!isPassCodesMatch) {
          setAttemptCounter(prev => prev + 1);
          setIsError(true);

          setTimeout(() => {
            setIsError(false);
            if (attemptCounter === 3) {
              setStoredPassCode('');
              setAttemptCounter(1);
              setStep(REGISTER_PASSCODE_STEPS.ENTER_PASSCODE);
            }
          }, 1500);
          return;
        }

        const biometryType = await getBiometrySupportedType();

        setBiometryType(biometryType || null);

        if (biometryType) {
          await askBiometryPermissions()
            .then(status => {
              if (
                status.type === RESULTS.LIMITED ||
                status.type === RESULTS.GRANTED
              ) {
                // turn on internal state isBiometryEnabled
                setIsBiometryEnabled(true);
                saveCredentialsWithBiometry(user?.email, pinCode);
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
                if (
                  error.type === RESULTS.BLOCKED ||
                  error.type === RESULTS.DENIED
                ) {
                  // turn off internal state isBiometryEnabled if it not the first entering
                  setIsBiometryEnabled(false);
                }
              }
            });
        }
        await saveCredentialsWithPassword(user?.email, pinCode);

        setIsPassCodeEntered(true);

        onRedirectToNextScreen();
      }
    }
  };

  const titleText = getPasscodeFormText(step);

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
});
