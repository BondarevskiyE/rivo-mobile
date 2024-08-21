import {LayoutAnimation} from './types';
import {withTiming} from 'react-native-reanimated';

export const fadeScaleExiting = (): // values: ExitAnimationsValues,
LayoutAnimation => {
  'worklet';
  const animations = {
    opacity: withTiming(0, {duration: 300}),
    transform: [{scale: withTiming(0, {duration: 300})}],
  };
  const initialValues = {
    opacity: 1,
    transform: [{scale: 1}],
  };
  return {
    initialValues,
    animations,
  };
};
