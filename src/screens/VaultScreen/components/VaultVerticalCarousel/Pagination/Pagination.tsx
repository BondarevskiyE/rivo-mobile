import {StyleSheet, View} from 'react-native';
import React from 'react';
import {SharedValue} from 'react-native-reanimated';

import {Colors} from '@/shared/ui';
import {Page} from '../types';
import {PaginationDot} from './PaginationDot';

interface Props {
  data: Page[];
  scrollY: SharedValue<number>;
}

export const Pagination = ({data, scrollY}: Props) => {
  return (
    <View style={styles.container}>
      {data.map((item, idx) => {
        return <PaginationDot idx={idx} scrollY={scrollY} key={item.id} />;
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 12,
    right: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 2,
    width: 20,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.ui_grey_95,
  },

  dotActive: {
    backgroundColor: Colors.ui_white,
  },
});
