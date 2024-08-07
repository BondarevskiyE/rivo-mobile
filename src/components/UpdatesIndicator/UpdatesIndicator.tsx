import {Colors} from '@/shared/ui';
import React, {useEffect} from 'react';
import {StyleSheet} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface Props {
  isActive: boolean;
}

export const UpdatesIndicator: React.FC<Props> = ({isActive}) => {
  const containerValue = useSharedValue(0);

  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(containerValue.value, [0, 100], [1, 0]),
      transform: [
        {
          scale: interpolate(containerValue.value, [0, 100], [0, 1]),
        },
      ],
    };
  });

  useEffect(() => {
    containerValue.value = withRepeat(
      withTiming(100, {duration: 1500}),
      -1,
      false,
    );
  }, [containerValue]);

  if (!isActive) {
    return null;
  }

  return <Animated.View style={[styles.container, containerStyle]} />;
};

const styles = StyleSheet.create({
  container: {
    width: 12,
    height: 12,
    backgroundColor: Colors.ui_green_75,
    borderRadius: 6,
  },
});
