import {StackCardInterpolationProps} from '@react-navigation/stack';
import {Animated} from 'react-native';

export const moveBottomToTop = ({
  current,
  // next,
  inverted,
  layouts: {screen},
}: StackCardInterpolationProps) => {
  const progress = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return {
    cardStyle: {
      transform: [
        {
          translateY: Animated.multiply(
            progress.interpolate({
              inputRange: [0, 1, 2],
              outputRange: [
                screen.height, // Focused, but offscreen in the beginning
                0, // Fully focused
                screen.height * -0.3, // Fully unfocused
              ],
              extrapolate: 'clamp',
            }),
            inverted,
          ),
        },
      ],
    },
  };
};
