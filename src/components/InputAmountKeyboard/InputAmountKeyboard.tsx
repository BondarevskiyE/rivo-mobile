import React from 'react';
import {View, StyleSheet} from 'react-native';

import {DialPad} from './DialPad';
import {Colors, Fonts} from '@/shared/ui';

interface Props {
  onPress: (symbol: string) => void;
  onRemove: () => void;
}

export const InputAmountKeyboard: React.FC<Props> = ({onPress, onRemove}) => {
  const onPressSymbol = async (symbol: string) => {
    if (symbol === 'del') {
      onRemove();
      return;
    }

    onPress(symbol);
  };

  return (
    <>
      <View style={styles.container}>
        <DialPad onPress={onPressSymbol} />
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
