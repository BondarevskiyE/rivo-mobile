import React, {useMemo, useState} from 'react';
import {View, StyleSheet, Text, Pressable} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import {initialWindowMetrics} from 'react-native-safe-area-context';

import {Colors, Fonts} from '@/shared/ui';
import {PasswordKeyboard} from '@/components';
import {PINCODE_LENGTH} from '@/shared/constants';
import {
  PROFILE_SCREENS,
  ProfileStackProps,
} from '@/navigation/types/profileStack';
import {ArrowLineIcon} from '@/shared/ui/icons';
import {getTitleText} from './helpers';
import {
  getCredentialsWithPassword,
  saveCredentialsWithPassword,
} from '@/services/keychain';
import {useUserStore} from '@/store/useUserStore';

type Props = StackScreenProps<
  ProfileStackProps,
  PROFILE_SCREENS.CHANGE_PASSCODE_SCREEN
>;

export enum CHANGE_PASSCODE_STEPS {
  ENTER_OLD_PASSCODE,
  SET_UP_NEW_PASSCODE,
  REPEAT_NEW_PASSCODE,
}

export const ChangePasscodeScreen: React.FC<Props> = ({navigation}) => {
  const [storedPassCode, setStoredPassCode] = useState<string>('');

  const [step, setStep] = useState(CHANGE_PASSCODE_STEPS.ENTER_OLD_PASSCODE);

  const [_, setAttemptCounter] = useState<number>(0);
  const [isError, setIsError] = useState<boolean>(false);

  const user = useUserStore(state => state.userInfo);

  const handleGoBack = () => {
    navigation.goBack();
  };

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
    switch (step) {
      case CHANGE_PASSCODE_STEPS.ENTER_OLD_PASSCODE: {
        const oldPasscode = await getCredentialsWithPassword();

        if (oldPasscode && oldPasscode?.password === pinCode) {
          setStep(CHANGE_PASSCODE_STEPS.SET_UP_NEW_PASSCODE);
        } else {
          setIsError(true);

          hideError(1500);
        }
        break;
      }

      case CHANGE_PASSCODE_STEPS.SET_UP_NEW_PASSCODE: {
        setStoredPassCode(pinCode);
        setStep(CHANGE_PASSCODE_STEPS.REPEAT_NEW_PASSCODE);
        break;
      }

      case CHANGE_PASSCODE_STEPS.REPEAT_NEW_PASSCODE: {
        const isPassCodesMatch = pinCode === storedPassCode;

        if (isPassCodesMatch && user?.email) {
          await saveCredentialsWithPassword(user?.email, pinCode);
          handleGoBack();
        } else {
          setAttemptCounter(prev => {
            if (prev + 1 === 3) {
              setStoredPassCode('');
              setStep(CHANGE_PASSCODE_STEPS.SET_UP_NEW_PASSCODE);

              return 0;
            }

            return prev + 1;
          });
          setIsError(true);

          hideError(1500);
        }
      }
    }
  };

  const titleText = getTitleText(step);

  return (
    <LinearGradient
      colors={['rgba(255, 255, 255, 1)', 'rgba(238, 231, 231, 1)']}
      style={styles.gradientContainer}>
      <View style={styles.container}>
        <Pressable onPress={handleGoBack} style={styles.closeIconContainer}>
          <ArrowLineIcon color={Colors.ui_grey_735} />
        </Pressable>

        <Text style={styles.title}>{titleText}</Text>

        <PasswordKeyboard
          onPinCodeFulfilled={onPinCodeFulfilled}
          isError={isError}
          pinCodeLength={PINCODE_LENGTH}
          hideError={hideError}
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
    paddingTop: initialWindowMetrics?.insets.top,
    backgroundColor: Colors.ui_background,
  },
  container: {
    position: 'relative',
    flex: 1,
    paddingTop: 63,
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 24,
    height: 68,
    fontFamily: Fonts.semiBold,
    lineHeight: 28.8,
    textAlign: 'center',
    marginTop: 10,
    color: Colors.ui_black,
  },
  closeIconContainer: {
    position: 'absolute',
    top: 7,
    left: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    backgroundColor: Colors.ui_grey_06,
    borderRadius: 18,
    zIndex: 2,

    transform: [
      {
        rotate: '180deg',
      },
    ],
  },
});
