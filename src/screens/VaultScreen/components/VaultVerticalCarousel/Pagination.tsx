import {StyleSheet, Animated, View, Dimensions} from 'react-native';
import React from 'react';
import {Colors} from '@/shared/ui';

interface Props {
  data: {id: string}[];
  scrollY: Animated.Value;
}

const {width} = Dimensions.get('screen');

export const Pagination = ({data, scrollY}: Props) => {
  return (
    <View style={styles.container}>
      {data.map((_, idx) => {
        const inputRange = [(idx - 1) * width, idx * width, (idx + 1) * width];

        const backgroundColor = scrollY.interpolate({
          inputRange,
          outputRange: [Colors.ui_grey_60, Colors.ui_white, Colors.ui_grey_60],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={idx.toString()}
            style={[styles.dot, {backgroundColor}]}
          />
        );
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
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    backgroundColor: Colors.ui_white,
  },
});
