import React from 'react';
import {StyleSheet, View} from 'react-native';
import {LineGraph} from 'react-native-graph';
import {Colors} from '@/shared/ui';

const chartMock = [
  {
    value: 1.707,
    date: new Date('2024-07-23'),
  },
  {
    value: 1.7258199575816024,
    date: new Date('2024-07-22'),
  },
  {
    value: 1.7089297629960172,
    date: new Date('2024-07-21'),
  },
  {
    value: 1.708974174971757,
    date: new Date('2024-07-20'),
  },
  {
    value: 1.6748980772223065,
    date: new Date('2024-07-19'),
  },
  {
    value: 1.6592356858155595,
    date: new Date('2024-07-18'),
  },
  {
    value: 1.668070327647913,
    date: new Date('2024-07-17'),
  },
];

export const ChartCarouselItem = () => {
  const isProgressive =
    chartMock[chartMock.length - 1].value >
    chartMock[chartMock.length - 2].value;
  return (
    <View style={styles.container}>
      <LineGraph
        points={chartMock}
        animated={true}
        enablePanGesture={true}
        color={isProgressive ? Colors.ui_green_45 : Colors.ui_grey_74}
        style={{flex: 1}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 390,
    width: '100%',
    padding: 12,
    paddingTop: 16,
    borderRadius: 32,
    backgroundColor: Colors.ui_black_65,
  },
});
