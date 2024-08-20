import React from 'react';
import {StyleSheet} from 'react-native';
import Animated from 'react-native-reanimated';
import {Fonts} from '@/shared/ui';
import {inputFadeScaleEntering} from '@/customAnimations/inputFadeScaleEntering';
import {inputFadeScaleExiting} from '@/customAnimations/inputFadeScaleExiting';

interface Props {
  symbol: string;
  color: string;
  fontSize: number;
  isAnimated: boolean;
}

export const AmountOutputSymbol: React.FC<Props> = ({
  symbol,
  color,
  fontSize,
  isAnimated,
}) => {
  return (
    <Animated.Text
      entering={isAnimated ? inputFadeScaleEntering : undefined}
      exiting={isAnimated ? inputFadeScaleExiting : undefined}
      style={[
        styles.inputText,
        {
          color,
          fontSize,
        },
      ]}>
      {symbol}
    </Animated.Text>
  );
};

const styles = StyleSheet.create({
  inputText: {
    fontFamily: Fonts.semiBold,
    fontSize: 64,
    transformOrigin: 'left',
  },
});
