
import {StyleSheet, Text, View} from 'react-native';

export function LightingScreen() {
  return (
    <View style={styles.container}>
      <Text>LightingScreen!</Text>
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
