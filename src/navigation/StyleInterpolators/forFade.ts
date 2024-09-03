import {StackCardInterpolationProps} from '@react-navigation/stack';

export const forFade = ({current}: StackCardInterpolationProps) => ({
  cardStyle: {
    opacity: current.progress,
  },
});
