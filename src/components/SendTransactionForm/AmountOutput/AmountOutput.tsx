import React, {useEffect} from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import Animated, {
  Easing,
  FadeInLeft,
  FadeOutLeft,
  SharedValue,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import {formatThousandSeparator} from '@/shared/lib/format';
import {getInputFontSize, getTextSignPositionStyles} from '../helpers';
import {Colors, Fonts} from '@/shared/ui';
import {
  AutofillButtons,
  SEND_TRANSACTION_FORM_TYPE,
  TEXT_SIGN_POSITION,
} from '../types';

import {AmountOutputSymbol} from './AmountOutputSymbol';
import {fadeScaleEntering} from '@/customAnimations/fadeScaleEntering';
import {fadeScaleExiting} from '@/customAnimations/fadeScaleExiting';
import {isSmallScreenDeviceHeight} from '@/shared/lib/screen';

interface Props {
  value: string;
  additionalValue: string;
  formType: SEND_TRANSACTION_FORM_TYPE;
  loadingValue: SharedValue<number>;
  isError: boolean;
  autofillButtons: AutofillButtons;
  onPressAutofillButton: (percent: number) => void;
  textSign?: string;
  textSignPosition?: TEXT_SIGN_POSITION;
}

export const AmountOutput: React.FC<Props> = ({
  value,
  additionalValue,
  formType,
  isError,
  autofillButtons,
  onPressAutofillButton,
  loadingValue,
  textSign,
  textSignPosition,
}) => {
  const errorValue = useSharedValue(0);

  useEffect(() => {
    if (+value && isError) {
      errorValue.value = withSequence(
        withTiming(-12, {duration: 25, easing: Easing.inOut(Easing.quad)}),
        withDelay(
          40,
          withTiming(7, {duration: 25, easing: Easing.inOut(Easing.quad)}),
        ),
        withDelay(
          40,
          withTiming(-5, {duration: 25, easing: Easing.inOut(Easing.quad)}),
        ),
        withDelay(
          40,
          withTiming(3, {duration: 25, easing: Easing.inOut(Easing.quad)}),
        ),
        withDelay(
          40,
          withTiming(-1, {duration: 25, easing: Easing.inOut(Easing.quad)}),
        ),
        withDelay(
          40,
          withTiming(0, {duration: 25, easing: Easing.inOut(Easing.quad)}),
        ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, isError]);

  const isSendFormType = formType === SEND_TRANSACTION_FORM_TYPE.SEND;

  const buttonsStyles = useAnimatedStyle(() => ({
    opacity: interpolate(loadingValue.value, [0, 0.5, 1], [1, 0, 0]),
    top: interpolate(loadingValue.value, [0, 1], [0, 50]),
  }));

  const amountContainerStyles = useAnimatedStyle(() => ({
    top: interpolate(
      loadingValue.value,
      [0, 1],
      [0, isSendFormType ? -60 : 35],
    ),
  }));

  const isInputEmpty = value === '';

  const outputFontSize = getInputFontSize(String(value).length);

  const inputValueArray = formatThousandSeparator(value || 0).split('');
  return (
    <Animated.View
      entering={fadeScaleEntering}
      exiting={fadeScaleExiting}
      style={styles.container}>
      <Animated.View
        style={[
          styles.amountTextPositionContainer,
          {transform: [{translateX: errorValue}]},
          amountContainerStyles,
        ]}>
        {textSign && (
          <Text
            style={[
              styles.signText,
              getTextSignPositionStyles(textSignPosition),
            ]}>
            {textSign}
          </Text>
        )}
        <View style={styles.inputTextContainer}>
          {inputValueArray.map((symbol, index) => (
            <AmountOutputSymbol
              key={index}
              isAnimated={index === inputValueArray.length - 1}
              symbol={symbol}
              color={isInputEmpty ? Colors.ui_grey_737 : Colors.ui_white}
              fontSize={outputFontSize}
            />
          ))}
          {additionalValue && (
            <Animated.Text
              entering={FadeInLeft}
              exiting={FadeOutLeft}
              style={[styles.inputText, styles.inputSubText]}>
              {additionalValue}
            </Animated.Text>
          )}
        </View>
      </Animated.View>
      <Animated.View style={[styles.percentAmountContainer, buttonsStyles]}>
        {autofillButtons.map(({name, percent}) => (
          <Pressable
            key={name}
            style={styles.percentAmountButton}
            onPress={() => onPressAutofillButton(percent)}>
            <Text style={styles.percentAmountButtonText}>{name}</Text>
          </Pressable>
        ))}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginTop: isSmallScreenDeviceHeight ? 20 : 40,
    marginBottom: 20,
  },
  amountTextPositionContainer: {
    position: 'relative',
    height: 74,
    marginBottom: 13,
  },
  signText: {
    position: 'absolute',
    fontFamily: Fonts.semiBold,
    color: Colors.ui_white,
  },
  inputTextContainer: {
    flexDirection: 'row',
  },
  inputText: {
    fontFamily: Fonts.semiBold,
    fontSize: 64,
  },
  inputSubText: {
    color: Colors.ui_grey_737,
  },
  percentAmountContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  percentAmountButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 15,
    backgroundColor: Colors.ui_brown_90,
  },
  percentAmountButtonText: {
    color: Colors.ui_orange_80,
  },
});
