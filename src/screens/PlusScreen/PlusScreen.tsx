import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

export function PlusScreen() {
  return (
    <View style={styles.container}>
      <Text>Plus!</Text>
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
