import {ArrowLineIcon} from '@/shared/ui/icons';
import React from 'react';
import {Pressable, Text, Dimensions, StyleSheet} from 'react-native';
import Animated from 'react-native-reanimated';
import {useDialPadSymbolAnimation} from './hooks';
import {Colors} from '@/shared/ui';

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
          width={20}
          height={22}
        />
      );

    case '':
      return null;
    default:
      return (
        <Text
          style={{
            fontSize: dialPadSize / 2.3,
            color: Colors.ui_white,
          }}>
          {symbolName}
        </Text>
      );
  }
};

const {width} = Dimensions.get('window');

const dialPadSize = width * 0.2;

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
    width: dialPadSize,
    height: dialPadSize,
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
