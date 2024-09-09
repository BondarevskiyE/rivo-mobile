import React from 'react';
import {Dimensions, FlatList, StyleSheet, View} from 'react-native';

import {DialPadSymbol} from './DialPadSymbol';
import {dialPadSymbols} from './lib';
import {isSmallScreenDeviceHeight} from '@/shared/lib/screen';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const symbolSizeMultiplier = isSmallScreenDeviceHeight ? 0.16 : 0.2;

export const DIALPAD_SYMBOL_SIZE = SCREEN_WIDTH * symbolSizeMultiplier;
const NUM_COLUMNS = 3;
const HORIZONTAL_PADDING = 13;
const COLUMN_GAP =
  (SCREEN_WIDTH - DIALPAD_SYMBOL_SIZE * NUM_COLUMNS) / 2 - HORIZONTAL_PADDING;

interface Props {
  onPress: (symbol: string) => void;
}

export const DialPad = ({onPress}: Props) => {
  return (
    <View style={styles.container}>
      <FlatList
        data={dialPadSymbols}
        numColumns={NUM_COLUMNS}
        style={styles.list}
        contentContainerStyle={styles.listContentContainer}
        keyExtractor={(_, index) => index.toString()}
        scrollEnabled={false}
        columnWrapperStyle={{
          columnGap: COLUMN_GAP,
        }}
        renderItem={({item}) => (
          <DialPadSymbol onPress={onPress} symbol={item} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    overflow: 'visible',
  },
  list: {
    flexGrow: 0,
    overflow: 'visible',
  },
  listContentContainer: {
    alignItems: 'center',
  },
});
