import {formatThousandSeparator} from '@/shared/lib/format';
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

import {getInputFontSize} from '../helpers';
import {Colors, Fonts} from '@/shared/ui';
import {AutofillButtons} from '../types';

import {AmountOutputSymbol} from './AmountOutputSymbol';

interface Props {
  value: string;
  additionalValue: string;
  loadingValue: SharedValue<number>;
  isEnoughBalance: boolean;

  autofillButtons: AutofillButtons;
  onPressAutofillButton: (percent: number) => void;
}

export const AmountOutput: React.FC<Props> = ({
  value,
  additionalValue,
  isEnoughBalance,
  autofillButtons,
  onPressAutofillButton,

  loadingValue,
}) => {
  const errorValue = useSharedValue(0);

  useEffect(() => {
    if (+value && !isEnoughBalance) {
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
  }, [value]);

  const buttonsStyles = useAnimatedStyle(() => ({
    opacity: interpolate(loadingValue.value, [0, 0.5, 1], [1, 0, 0]),
    top: interpolate(loadingValue.value, [0, 1], [0, 50]),
  }));

  const amountContainerStyles = useAnimatedStyle(() => ({
    top: interpolate(loadingValue.value, [0, 1], [0, 35]),
  }));

  const isInputEmpty = value === '';

  const outputFontSize = getInputFontSize(String(value).length);

  const inputValueArray = formatThousandSeparator(value || 0).split('');
  return (
    <View style={[styles.container]}>
      <Animated.View
        style={[
          styles.amountTextPositionContainer,
          {transform: [{translateX: errorValue}]},
          amountContainerStyles,
        ]}>
        <Text style={styles.dollarText}>$</Text>
        <View style={styles.inputTextContainer}>
          {inputValueArray.map((symbol, index) => (
            <AmountOutputSymbol
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  amountTextPositionContainer: {
    position: 'relative',
    height: 74,
    marginBottom: 13,
  },
  dollarText: {
    position: 'absolute',
    left: -18,

    fontFamily: Fonts.semiBold,
    fontSize: 24,

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
