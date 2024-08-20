import {formatThousandSeparator} from '@/shared/lib/format';
import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';

import {getInputFontSize} from '../helpers';
import {Colors, Fonts} from '@/shared/ui';
import {AutofillButtons} from '../types';
import Animated, {
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

interface Props {
  value: string;
  additionalValue: string;
  loadingValue: SharedValue<number>;

  autofillButtons: AutofillButtons;
  onPressAutofillButton: (percent: number) => void;
}

export const AmountOutput: React.FC<Props> = ({
  value,
  additionalValue,
  autofillButtons,
  onPressAutofillButton,

  loadingValue,
}) => {
  const buttonsStyles = useAnimatedStyle(() => ({
    opacity: interpolate(loadingValue.value, [0, 0.5, 1], [1, 0, 0]),
    top: interpolate(loadingValue.value, [0, 1], [0, 50]),
  }));

  const amountContainerStyles = useAnimatedStyle(() => ({
    top: interpolate(loadingValue.value, [0, 1], [0, 35]),
  }));

  const isInputEmpty = value === '';
  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.amountTextPositionContainer, amountContainerStyles]}>
        <Text style={styles.dollarText}>$</Text>
        <View style={styles.inputTextContainer}>
          <Text
            style={[
              styles.inputText,
              {
                color: isInputEmpty ? Colors.ui_grey_737 : Colors.ui_white,
                fontSize: getInputFontSize(String(value).length),
              },
            ]}>
            {formatThousandSeparator(value || 0)}
          </Text>
          {additionalValue && (
            <Text style={[styles.inputText, styles.inputSubText]}>
              {additionalValue}
            </Text>
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
