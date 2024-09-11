import {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const animation_state = {
  start: 0,
  middle: 0.5,
  end: 1,
};

export const useDialPadSymbolAnimation = () => {
  const animatedValue = useSharedValue(animation_state.start);

  const pressIn = () => {
    animatedValue.value = withTiming(animation_state.end, {duration: 150});
  };

  const pressOut = () => {
    animatedValue.value = withTiming(animation_state.start, {duration: 150});
  };

  const inputRange = [animation_state.start, animation_state.end];

  const styles = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(animatedValue.value, inputRange, [
      'rgba(244, 244, 247, 0)',
      'rgba(244, 244, 247, 1)',
    ]),
    transform: [
      {
        scale: interpolate(animatedValue.value, inputRange, [1, 1.1]),
      },
    ],
  }));

  return {
    pressIn,
    pressOut,
    styles,
  };
};
