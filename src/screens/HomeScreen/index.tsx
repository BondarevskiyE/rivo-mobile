import React from 'react';
import {StyleSheet} from 'react-native';

import {Text, View, ScrollView} from 'react-native';

const HomeScreen = () => {
  return (
    <ScrollView style={styles.Container}>
      <View style={styles.Wrapper}>
        <Text>Your Home Screen</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  Container: {
    backgroundColor: '#FFF',
  },
  Wrapper: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    padding: 40,
    width: '100%',
  },
});

export default HomeScreen;
