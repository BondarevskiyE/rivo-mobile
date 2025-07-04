import {LayoutAnimation} from './types';
import {withTiming} from 'react-native-reanimated';

export const inputFadeScaleEntering =
  (): // targetValues: EntryAnimationsValues,
  LayoutAnimation => {
    'worklet';
    const animations = {
      // originX: withTiming(targetValues.targetOriginX, {duration: 300}),
      opacity: withTiming(1, {duration: 300}),
      transform: [{scale: withTiming(1, {duration: 300})}],
    };
    const initialValues = {
      // originX: targetValues.targetOriginX - 20,
      opacity: 0.5,
      transform: [{scale: 0.5}],
    };
    return {
      initialValues,
      animations,
    };
  };
