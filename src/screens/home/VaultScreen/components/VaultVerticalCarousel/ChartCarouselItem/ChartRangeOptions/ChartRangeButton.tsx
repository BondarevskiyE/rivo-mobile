import  {useEffect} from 'react';
import {Pressable, StyleSheet} from 'react-native';

import {Colors, Fonts} from '@/shared/ui';
import ReAnimated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface Props<T> {
  period: T;
  isActive: boolean;
  onPress: (period: T) => void;
}

export function ChartRangeButton<T extends string>({
  period,
  isActive,
  onPress,
}: Props<T>) {
  const selectedValue = useSharedValue(0);

  useEffect(() => {
    selectedValue.value = withTiming(isActive ? 1 : 0, {duration: 150});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const selectedStyles = useAnimatedStyle(() => {
    const color = interpolateColor(
      selectedValue.value,
      [0, 1],
      [Colors.ui_grey_65, Colors.ui_white],
    );

    return {color};
  });

  const selectedContainerStyles = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      selectedValue.value,
      [0, 1],
      [Colors.transparent, Colors.ui_black_60],
    );

    return {backgroundColor, transform: [{scale: selectedValue.value}]};
  });

  return (
    <Pressable onPress={() => onPress(period)} style={styles.container}>
      <ReAnimated.Text style={[styles.buttonText, selectedStyles]}>
        {period.toUpperCase()}
      </ReAnimated.Text>
      <ReAnimated.View
        style={[styles.selectedContainer, selectedContainerStyles]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 40,
    height: 36,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.transparent,
    zIndex: 2,
  },
  selectedContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    borderRadius: 20,
    transformOrigin: 'center',
  },
  buttonText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 20.3,
    zIndex: 2,
  },
});
