import {StackCardInterpolationProps} from '@react-navigation/stack';
import {Animated} from 'react-native';

export const moveRightToLeft = ({
  current,
  // next,
  inverted,
  layouts: {screen},
}: StackCardInterpolationProps) => {
  return {
    cardStyle: {
      transform: [
        {
          translateX: Animated.multiply(
            current.progress.interpolate({
              inputRange: [0, 1, 2],
              outputRange: [
                screen.width, // Focused, but offscreen in the beginning
                0, // Fully focused
                screen.width * -0.3, // Fully unfocused
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
