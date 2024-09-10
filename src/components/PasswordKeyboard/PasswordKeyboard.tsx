import React, { useEffect, useRef, useState } from 'react';
import {View, StyleSheet, Animated, Easing} from 'react-native';

import {DialPad} from './DialPad';
import {Colors, Fonts} from '@/shared/ui';
import {AnimatedDot} from './AnimatedDot';

interface Props {
  onPinCodeFulfilled: (pinCode: string) => void;
  isError: boolean;
  onClickBiometry?: () => void;
  onExit?: () => void;
  pinCodeLength?: number;
}

export const PasswordKeyboard: React.FC<Props> = ({
  onPinCodeFulfilled,
  onClickBiometry,
  onExit,
  isError,
  pinCodeLength = 4,
}) => {
  const [pinCode, setPinCode] = useState<(string | number)[]>([]);

  const wrongCodeAnimationValue = useRef(new Animated.Value(0)).current;
  const wrongCodeErrorOpacityValue = useRef(new Animated.Value(0)).current;

  const isPinCodeFulfilled = pinCode.length === pinCodeLength;

  const onPressSymbol = async (symbol: string | number) => {
    if (isError) {
      return;
    }

    if (symbol === 'del') {
      setPinCode(prevCode => prevCode.slice(0, prevCode.length - 1));
      return;
    }

    if (!!onClickBiometry && symbol === 'biometry') {
      onClickBiometry();
      return;
    }

    if (!!onExit && symbol === 'exit') {
      onExit();
      return;
    }

    if (isPinCodeFulfilled) {
      return;
    }

    if (Number.isInteger(+symbol)) {
      setPinCode(prevCode => [...prevCode, symbol]);
    }
  };

  const startWrongPasswordAnimation = () => {
    Animated.timing(wrongCodeErrorOpacityValue, {
      toValue: 1,
      useNativeDriver: true,
      duration: 100,
    }).start();

    Animated.sequence([
      Animated.delay(40),
      Animated.timing(wrongCodeAnimationValue, {
        toValue: -12,
        useNativeDriver: true,
        duration: 25,
        easing: Easing.inOut(Easing.quad),
      }),
      Animated.delay(40),
      Animated.timing(wrongCodeAnimationValue, {
        toValue: 7,
        useNativeDriver: true,
        duration: 25,
        easing: Easing.inOut(Easing.quad),
      }),
      Animated.delay(40),
      Animated.timing(wrongCodeAnimationValue, {
        toValue: -5,
        useNativeDriver: true,
        duration: 25,
        easing: Easing.inOut(Easing.quad),
      }),
      Animated.delay(40),
      Animated.timing(wrongCodeAnimationValue, {
        toValue: 3,
        useNativeDriver: true,
        duration: 25,
        easing: Easing.inOut(Easing.quad),
      }),
      Animated.delay(40),
      Animated.timing(wrongCodeAnimationValue, {
        toValue: -1,
        useNativeDriver: true,
        duration: 25,
        easing: Easing.inOut(Easing.quad),
      }),
      Animated.delay(40),
      Animated.timing(wrongCodeAnimationValue, {
        toValue: 0,
        useNativeDriver: true,
        duration: 25,
        easing: Easing.inOut(Easing.quad),
      }),
    ]).start();
  };

  useEffect(() => {
    if (isError) {
      startWrongPasswordAnimation();
      return;
    }

    Animated.timing(wrongCodeErrorOpacityValue, {
      toValue: 0,
      useNativeDriver: true,
      duration: 100,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError]);

  useEffect(() => {
    if (isPinCodeFulfilled) {
      onPinCodeFulfilled(pinCode.join(''));

      const timeout = setTimeout(() => {
        setPinCode([]);
      }, 100);

      return () => {
        clearTimeout(timeout);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPinCodeFulfilled]);

  return (
    <>
      <View style={styles.container}>
        <View>
          <Animated.View
            style={[
              styles.dotsContainer,
              {transform: [{translateX: wrongCodeAnimationValue}]},
            ]}>
            {[...Array(pinCodeLength).keys()].map(index => {
              const isSelected = !!pinCode[index];

              return (
                <AnimatedDot
                  isSelected={isSelected}
                  isError={isError}
                  errorDelay={index * 50}
                  key={index}
                />
              );
            })}
          </Animated.View>
          <Animated.Text
            style={[styles.errorText, {opacity: wrongCodeErrorOpacityValue}]}>
            Wrong passcode. Try again
          </Animated.Text>
        </View>
        <DialPad
          onPress={onPressSymbol}
          // if even one symbol is entered we need to change biometry to delete button
          withBiometry={!pinCode.length && !!onClickBiometry}
          withExit={!!onExit}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    height: 68,
    fontFamily: Fonts.bold,
    lineHeight: 33.6,
    textAlign: 'center',
    marginTop: 60,
  },
  errorText: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    marginTop: 12,
    color: Colors.error_red,
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
