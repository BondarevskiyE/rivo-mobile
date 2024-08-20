import {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const animation_state = {
  start: 0,
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
