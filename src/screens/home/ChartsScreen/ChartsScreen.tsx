
import {StyleSheet, Text, View} from 'react-native';

export function ChartsScreen() {
  return (
    <View style={styles.container}>
      <Text>Charts!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
