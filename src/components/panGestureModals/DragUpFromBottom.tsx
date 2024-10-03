import {Dimensions, Pressable, StyleSheet, View} from 'react-native';
import React, {useCallback, useImperativeHandle, useRef, useState} from 'react';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import ReAnimated, {
  SharedValue,
  runOnJS,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {ScrollView} from 'react-native-gesture-handler';

import {Colors} from '@/shared/ui';

const AScrollView = ReAnimated.createAnimatedComponent(ScrollView);

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

const MAX_TRANSLATE_Y = -SCREEN_HEIGHT + 15;

type DragUpFromBottomProps = {
  children?: React.ReactNode;
  initialTranslateY?: number;
  translateYOffset?: number;
  dragAnimationValue?: SharedValue<number>;
  hideDragLine?: boolean;
};

export type DragUpFromBottomRefProps = {
  scrollTo: (destination: number) => void;
  isActive: () => boolean;
};

export const DragUpFromBottom = React.forwardRef<
  DragUpFromBottomRefProps,
  DragUpFromBottomProps
>(
  (
    {
      children,
      initialTranslateY = 0,
      translateYOffset,
      dragAnimationValue,
      hideDragLine,
    },
    ref,
  ) => {
    const [initialYCoordinate, setInitialYCoordinate] = useState(0);
    const [isScrollListEnabled, setIsScrollListEnabled] = useState(false);

    const scrollRef = useRef<ScrollView>(null);

    const scrollY = useSharedValue(0);
    const translateY = useSharedValue(initialTranslateY);
    const active = useSharedValue(false);
    const scrollingState = useSharedValue(false);

    const maxTranslateY =
      MAX_TRANSLATE_Y - initialYCoordinate - (translateYOffset || 0);
    const screenHeight =
      -SCREEN_HEIGHT - initialYCoordinate - (translateYOffset || 0);

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

    useImperativeHandle(ref, () => ({scrollTo, isActive}), [
      scrollTo,
      isActive,
    ]);

    // smooth prop enables withTiming, it is here for clicking open/close button without draging
    const playDragAnimation = (value: number, smooth?: boolean) => {
      'worklet';

      if (!dragAnimationValue) {
        return;
      }

      if (smooth) {
        dragAnimationValue.value = withTiming(value);
        return;
      }

      dragAnimationValue.value = value;
    };

    const context = useSharedValue({y: 0});

    const gesture = Gesture.Pan()
      .onTouchesMove((e, state) => {
        const isScrollZero = scrollY.value === 0;
        const isPanOpen = active.value;

        if (!isScrollZero && isPanOpen) {
          state.fail();
        }
      })
      .onStart(() => {
        context.value = {y: translateY.value};
      })
      .onUpdate(event => {
        const newValue = event.translationY + context.value.y;

        if (newValue > 0) {
          return;
        }
        translateY.value = event.translationY + context.value.y;

        translateY.value = Math.max(translateY.value, maxTranslateY);

        playDragAnimation?.(translateY.value);
      })
      .onEnd(() => {
        // scroll to 0 position
        if (
          active.value &&
          translateY.value > maxTranslateY &&
          translateY.value > screenHeight / 1.2
        ) {
          scrollTo(0);
          playDragAnimation?.(0, true);

          return;
        }
        // scroll to top position
        if (
          !active.value &&
          translateY.value !== 0 &&
          translateY.value < screenHeight / 10
        ) {
          scrollTo(maxTranslateY);
          playDragAnimation?.(maxTranslateY, true);
          return;
        }

        // scroll to start position if the user didn't pull enough
        if (active.value) {
          scrollTo(maxTranslateY);
          playDragAnimation?.(maxTranslateY);
        } else {
          scrollTo(0);
          playDragAnimation?.(0, true);
        }
      })
      .onFinalize(() => {
        scrollingState.value = true;
      })
      .simultaneousWithExternalGesture(scrollRef);

    const rBottomSheetStyle = useAnimatedStyle(() => ({
      transform: [{translateY: translateY.value}],
    }));

    const onPressDragLine = () => {
      if (active.value) {
        scrollTo(0);
        playDragAnimation?.(0, true);
      } else {
        scrollTo(maxTranslateY);
        playDragAnimation?.(maxTranslateY, true);
      }
    };

    const scrollHandler = useAnimatedScrollHandler(({contentOffset}) => {
      scrollY.value = Math.round(contentOffset.y);
    });

    useAnimatedReaction(
      () => active.value && scrollingState.value,
      (currentValue, previousValue) => {
        if (currentValue !== previousValue) {
          runOnJS(setIsScrollListEnabled)(currentValue);
        }
      },
    );

    return (
      <GestureDetector gesture={gesture}>
        <ReAnimated.View
          style={[styles.bottomSheetContainer, rBottomSheetStyle]}
          onLayout={e => {
            setInitialYCoordinate(e.nativeEvent.layout.y);
          }}>
          {!hideDragLine && (
            <Pressable onPress={onPressDragLine}>
              <View style={styles.line} />
            </Pressable>
          )}
          <AScrollView
            ref={scrollRef}
            scrollEnabled={isScrollListEnabled}
            bounces={false}
            onScroll={scrollHandler}
            scrollEventThrottle={17}
            showsVerticalScrollIndicator={false}
            style={styles.scrollContainer}>
            {children}
          </AScrollView>
        </ReAnimated.View>
      </GestureDetector>
    );
  },
);

const styles = StyleSheet.create({
  bottomSheetContainer: {
    height: SCREEN_HEIGHT,
    width: '100%',
    backgroundColor: 'white',
    position: 'relative',
    overflow: 'hidden',
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
  scrollContainer: {
    flex: 1,
  },
});
