import {LayoutAnimation} from './types';
import {withTiming} from 'react-native-reanimated';

export const fadeScaleEntering = (): LayoutAnimation => {
  'worklet';
  const animations = {
    opacity: withTiming(1, {duration: 300}),
    transform: [{scale: withTiming(1, {duration: 300})}],
  };
  const initialValues = {
    opacity: 0,
    transform: [{scale: 0.9}],
  };
  return {
    initialValues,
    animations,
  };
};
