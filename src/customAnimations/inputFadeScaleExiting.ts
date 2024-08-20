import {LayoutAnimation} from './types';
import {withTiming} from 'react-native-reanimated';

export const inputFadeScaleExiting = (): // values: ExitAnimationsValues,
LayoutAnimation => {
  'worklet';
  const animations = {
    // originX: withTiming(values.currentOriginX - 50, {duration: 150}),
    opacity: withTiming(0, {duration: 200}),
    transform: [{scale: withTiming(0.66, {duration: 200})}],
  };
  const initialValues = {
    // originX: values.currentOriginX,
    opacity: 1,
    transform: [{scale: 1}],
  };
  return {
    initialValues,
    animations,
  };
};
