import {DeleteSymbolIcon, FaceIdIcon, ExitIcon} from '@/shared/ui/icons';
import React from 'react';
import {Pressable, Animated, Text, Dimensions} from 'react-native';
import {useDialPadSymbolAnimation} from './hooks';

interface Props {
  onPress: (symbol: string) => void;
  symbol: string;
}

const getSymbolElement = (symbolName: string) => {
  switch (symbolName) {
    case 'del':
      return <DeleteSymbolIcon />;
    case 'exit':
      return <ExitIcon />;
    case 'biometry':
      return <FaceIdIcon />;
    case '':
      return null;
    default:
      return (
        <Text
          style={{
            fontSize: dialPadSize / 2.3,
            color: 'black',
          }}>
          {symbolName}
        </Text>
      );
  }
};

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
        {getSymbolElement(symbol)}
      </Animated.View>
    </Pressable>
  );
};
