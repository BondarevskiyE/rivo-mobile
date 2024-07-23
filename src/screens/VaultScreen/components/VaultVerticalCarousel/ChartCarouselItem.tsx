import React from 'react';
import {StyleSheet, View} from 'react-native';
import {LineGraph} from 'react-native-graph';
import {Colors} from '@/shared/ui';

const chartMock = [
  {value: 1, date: new Date('1-02-2002')},
  {value: 2, date: new Date('1-02-2003')},
  {value: 3, date: new Date('1-02-2004')},
  {value: 4, date: new Date('1-02-2005')},
  {value: 5, date: new Date('1-02-2006')},
];

export const ChartCarouselItem = () => {
  return (
    <View style={styles.container}>
      <LineGraph points={chartMock} animated color={Colors.blue_text} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 390,
    width: '100%',
    borderRadius: 32,
    backgroundColor: Colors.ui_black_65,
  },
});
