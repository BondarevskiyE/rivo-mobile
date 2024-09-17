import {useEffect} from 'react';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import {WaveIcon} from '@/shared/ui/icons/WaveIcon';

export const WaveLoader = () => {
  const animationValue = useSharedValue(0);

  useEffect(() => {
    animationValue.value = withRepeat(withTiming(1, {duration: 1500}), -1);
  }, []);

  const styles = useAnimatedStyle(() => ({
    opacity: interpolate(animationValue.value, [0, 0.5, 1], [0.1, 0.2, 0.1]),
  }));

  return (
    <Animated.View style={styles}>
      <WaveIcon style={{transform: [{scaleX: 1.3}]}} />
    </Animated.View>
  );
};
