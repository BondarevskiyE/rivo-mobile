import  {useEffect} from 'react';
import {StyleSheet} from 'react-native';
import ReAnimated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import {Colors} from '@/shared/ui';

interface Props {
  isSelected: boolean;
  isError: boolean;
  errorDelay?: number;
}

export const AnimatedDot = ({isSelected, isError, errorDelay = 0}: Props) => {
  const selectValue = useSharedValue(0);
  const errorValue = useSharedValue(0);

  useEffect(() => {
    if (isSelected) {
      selectValue.value = withTiming(1, {duration: 150});
      return;
    }
    selectValue.value = withTiming(0, {duration: 150});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelected]);

  useEffect(() => {
    if (isError) {
      errorValue.value = withDelay(errorDelay, withTiming(1, {duration: 100}));
      return;
    }
    errorValue.value = withTiming(0, {duration: 100});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError]);

  const dotStyle = useAnimatedStyle(() => {
    const size = interpolate(selectValue.value, [0, 1], [14, 16.8]);
    const selectedBackground = interpolateColor(
      selectValue.value,
      [0, 1],
      [Colors.ui_grey_10, Colors.ui_dark_blue],
    );

    const errorBackground = interpolateColor(
      errorValue.value,
      [0, 1],
      [Colors.ui_dark_blue, Colors.error_red],
    );

    return {
      width: size,
      height: size,
      backgroundColor: isError ? errorBackground : selectedBackground,
    };
  });

  return <ReAnimated.View style={[styles.dot, dotStyle]} />;
};

const styles = StyleSheet.create({
  dot: {
    borderRadius: 22,
    backgroundColor: 'black',
  },
});
