
import {FlatList, StyleSheet, View} from 'react-native';

import {DialPadSymbol} from './DialPadSymbol';
import {getDialPadSymbols} from './lib';

interface Props {
  onPress: (symbol: string | number) => void;
  withBiometry?: boolean;
  withExit?: boolean;
}

export const DialPad = ({
  onPress,
  withBiometry = false,
  withExit = false,
}: Props) => {
  const dialPadSymbols = getDialPadSymbols({withBiometry, withExit});
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
    flex: 1,
    justifyContent: 'flex-end',
    overflow: 'visible',
    paddingBottom: 30,
  },
  list: {
    flexGrow: 0,
    padding: 40,
    paddingBottom: 0,
    overflow: 'visible',
  },
});
