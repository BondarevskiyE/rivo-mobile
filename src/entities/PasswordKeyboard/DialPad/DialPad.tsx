import React from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {dialPadSymbols} from './constant';
import {DialPadSymbol} from './DialPadSymbol';

interface Props {
  onPress: (symbol: string | number) => void;
}

export const DialPad = ({onPress}: Props) => {
  return (
    <View style={styles.container}>
      <FlatList
        data={dialPadSymbols}
        numColumns={3}
        style={styles.list}
        keyExtractor={(_, index) => index.toString()}
        scrollEnabled={false}
        columnWrapperStyle={{gap: 24}}
        contentContainerStyle={{gap: 24}}
        renderItem={({item}) => (
          <DialPadSymbol onPress={onPress} symbol={item} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: '65%',
    // height: 'auto',
    overflow: 'visible',
  },
  list: {
    overflow: 'visible',
  },
});
