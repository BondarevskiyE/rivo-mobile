import {Dimensions, Pressable, StyleSheet, View} from 'react-native';
import React, {useCallback, useImperativeHandle, useState} from 'react';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {Colors} from '@/shared/ui';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

const MAX_TRANSLATE_Y = -SCREEN_HEIGHT + 15;

type DragUpFromBottomProps = {
  children?: React.ReactNode;
  initialTranslateY?: number;
};

export type DragUpFromBottomRefProps = {
  scrollTo: (destination: number) => void;
  isActive: () => boolean;
};

export const DragUpFromBottom = React.forwardRef<
  DragUpFromBottomRefProps,
  DragUpFromBottomProps
>(({children, initialTranslateY = 0}, ref) => {
  const [initialYCoordinate, setInitialYCoordinate] = useState(0);

  const translateY = useSharedValue(initialTranslateY);
  const active = useSharedValue(false);

  const maxTranslateY = MAX_TRANSLATE_Y - initialYCoordinate;
  const screenHeight = -SCREEN_HEIGHT - initialYCoordinate;

  const scrollTo = useCallback((destination: number) => {
    'worklet';
    active.value = destination !== 0;

    translateY.value = withSpring(destination, {
      stiffness: 177.8,
      damping: 20,
      mass: 1,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isActive = useCallback(() => {
    return active.value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({scrollTo, isActive}), [scrollTo, isActive]);

  const context = useSharedValue({y: 0});
  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = {y: translateY.value};
    })
    .onUpdate(event => {
      translateY.value = event.translationY + context.value.y;
      translateY.value = Math.max(translateY.value, maxTranslateY);
    })
    .onEnd(() => {
      if (translateY.value > screenHeight / 2) {
        scrollTo(0);
      } else {
        scrollTo(maxTranslateY);
      }
    });

  const rBottomSheetStyle = useAnimatedStyle(() => ({
    transform: [{translateY: translateY.value}],
  }));

  const onPressDragLine = () => {
    if (active.value) {
      scrollTo(0);
    } else {
      scrollTo(maxTranslateY);
    }
  };

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[styles.bottomSheetContainer, rBottomSheetStyle]}
        onLayout={e => setInitialYCoordinate(e.nativeEvent.layout.y)}>
        <Pressable onPress={onPressDragLine}>
          <View style={styles.line} />
        </Pressable>
        {children}
      </Animated.View>
    </GestureDetector>
  );
});

const styles = StyleSheet.create({
  bottomSheetContainer: {
    height: SCREEN_HEIGHT,
    width: '100%',
    backgroundColor: 'white',
    position: 'relative',
    borderRadius: 32,
  },
  line: {
    width: 36,
    height: 6,
    backgroundColor: Colors.ui_grey_13,
    alignSelf: 'center',
    marginVertical: 8,
    borderRadius: 3,
  },
});
