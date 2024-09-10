import React from 'react';
import {Pressable, Text, StyleSheet} from 'react-native';
import Animated from 'react-native-reanimated';

import { ArrowLineIcon } from '@/shared/ui/icons';
import {useDialPadSymbolAnimation} from './hooks';
import {Colors} from '@/shared/ui';
import {DIALPAD_SYMBOL_SIZE} from './DialPad';
import {isSmallScreenDeviceHeight} from '@/shared/lib/screen';

interface Props {
  onPress: (symbol: string) => void;
  symbol: string;
}

const getSymbolElement = (symbolName: string) => {
  switch (symbolName) {
    case 'del':
      return (
        <ArrowLineIcon
          style={styles.deleteIcon}
          color={Colors.ui_white}
          width={isSmallScreenDeviceHeight ? 15 : 20}
          height={isSmallScreenDeviceHeight ? 17 : 22}
        />
      );

    case '':
      return null;
    default:
      return (
        <Text
          style={{
            fontSize: DIALPAD_SYMBOL_SIZE / 2.3,
            color: Colors.ui_white,
          }}>
          {symbolName}
        </Text>
      );
  }
};

export const DialPadSymbol: React.FC<Props> = ({onPress, symbol}) => {
  const {
    pressIn,
    pressOut,
    styles: animatedStyles,
  } = useDialPadSymbolAnimation();
  return (
    <Pressable
      onPress={() => onPress(symbol)}
      onPressIn={pressIn}
      onPressOut={pressOut}>
      <Animated.View style={[styles.symbolContainer, animatedStyles]}>
        {getSymbolElement(symbol)}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  symbolContainer: {
    width: DIALPAD_SYMBOL_SIZE,
    height: DIALPAD_SYMBOL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.transparent,
  },
  deleteIcon: {
    transform: [
      {
        rotate: '180deg',
      },
    ],
  },
});
