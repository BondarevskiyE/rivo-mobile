import {DeleteSymbolIcon} from '@/shared/ui/icons';
import React from 'react';
import {Pressable, Animated, Text, Dimensions} from 'react-native';
import {useDialPadSymbolAnimation} from './hooks';

interface Props {
  onPress: (symbol: string) => void;
  symbol: string;
}

const {width} = Dimensions.get('window');

const dialPadSize = width * 0.2;

export const DialPadSymbol: React.FC<Props> = ({onPress, symbol}) => {
  const {pressIn, pressOut, backgroundColor, scale} =
    useDialPadSymbolAnimation();
  return (
    <Pressable
      onPress={() => onPress(symbol)}
      onPressIn={pressIn}
      onPressOut={pressOut}>
      <Animated.View
        style={{
          width: dialPadSize,
          height: dialPadSize,
          borderRadius: dialPadSize / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor,
          transform: [{scale}],
        }}>
        {symbol === 'del' ? (
          <DeleteSymbolIcon />
        ) : symbol === '' ? null : (
          <Text
            style={{
              fontSize: dialPadSize / 2.3,
              color: 'black',
            }}>
            {symbol}
          </Text>
        )}
      </Animated.View>
    </Pressable>
  );
};
