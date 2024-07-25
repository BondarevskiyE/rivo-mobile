import React from 'react';
import {Dimensions, StyleSheet} from 'react-native';
import ReAnimated, {
  SharedValue,
  useAnimatedStyle,
  interpolateColor,
} from 'react-native-reanimated';

import {Colors} from '@/shared/ui';

const {width} = Dimensions.get('screen');

interface PaginationDotProps {
  idx: number;
  scrollY: SharedValue<number>;
}

export const PaginationDot: React.FC<PaginationDotProps> = ({idx, scrollY}) => {
  const dotStyles = useAnimatedStyle(() => {
    const inputRange = [(idx - 1) * width, idx * width, (idx + 1) * width];

    const backgroundColor = interpolateColor(scrollY.value, inputRange, [
      Colors.ui_grey_60,
      Colors.ui_white,
      Colors.ui_grey_60,
    ]);

    return {
      backgroundColor,
    };
  });
  return <ReAnimated.View style={[styles.dot, dotStyles]} />;
};

const styles = StyleSheet.create({
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
