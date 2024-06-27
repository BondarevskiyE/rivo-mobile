import {Colors} from '@/shared/ui';
import {useRef} from 'react';
import {Animated} from 'react-native';

const animation_state = {
  start: 0,
  end: 1,
};

export const useDialPadSymbolAnimation = () => {
  const animatedValue = useRef(
    new Animated.Value(animation_state.start),
  ).current;

  const pressIn = () => {
    Animated.timing(animatedValue, {
      toValue: animation_state.end,
      useNativeDriver: true,
      duration: 150,
    }).start();
  };

  const pressOut = () => {
    Animated.timing(animatedValue, {
      toValue: animation_state.start,
      useNativeDriver: true,
      duration: 150,
    }).start();
  };

  const inputRange = [animation_state.start, animation_state.end];

  const backgroundColor = animatedValue.interpolate({
    inputRange,
    outputRange: [Colors.ui_background, 'rgba(244, 244, 247, 1)'],
  });

  const scale = animatedValue.interpolate({
    inputRange,
    outputRange: [1, 1.1],
  });

  return {
    pressIn,
    pressOut,
    backgroundColor,
    scale,
  };
};
