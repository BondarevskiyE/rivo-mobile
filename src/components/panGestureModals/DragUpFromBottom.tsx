import {Dimensions, Pressable, StyleSheet, View} from 'react-native';
import React, {useCallback, useImperativeHandle, useRef, useState} from 'react';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import ReAnimated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {Colors} from '@/shared/ui';
import {ScrollView} from 'react-native-gesture-handler';

const AScrollView = ReAnimated.createAnimatedComponent(ScrollView);

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

const MAX_TRANSLATE_Y = -SCREEN_HEIGHT + 15;

type DragUpFromBottomProps = {
  children?: React.ReactNode;
  initialTranslateY?: number;
  translateYOffset?: number;
  playDragAnimation?: (value: number) => void;
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
    {children, initialTranslateY = 0, translateYOffset, playDragAnimation},
    ref,
  ) => {
    const [initialYCoordinate, setInitialYCoordinate] = useState(0);

    const scrollRef = useRef<ScrollView>(null);

    const scrollY = useSharedValue(0);
    const translateY = useSharedValue(initialTranslateY);
    const active = useSharedValue(false);
    const scrollingState = useSharedValue(false);
    const touchStart = useSharedValue({x: 0, y: 0, time: 0});

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

    const context = useSharedValue({y: 0});
    const gesture = Gesture.Pan()
      .manualActivation(true)
      .onBegin(e => {
        touchStart.value = {
          x: e.x,
          y: e.y,
          time: Date.now(),
        };
      })
      .onTouchesMove((e, state) => {
        const isScrollZero = scrollY.value === 0;
        const isPanOpen = active.value;
        const isMoveDown = e.changedTouches[0].y > touchStart.value.y;
        const isOpenPanGesture = !isMoveDown && !isPanOpen;
        const isClosePanGesture = isMoveDown && isPanOpen && isScrollZero;

        // 6px is a height of line + 2 margins of 8px = 22px / + 20px is if the user drag fast
        const isDragLineTouch = e.changedTouches[0].y <= 42;

        if (isOpenPanGesture || isClosePanGesture || isDragLineTouch) {
          scrollingState.value = false;
          state.activate();
        } else {
          scrollingState.value = true;
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
          playDragAnimation?.(0);
          return;
        }
        // scroll to top position
        if (
          !active.value &&
          translateY.value !== 0 &&
          translateY.value < screenHeight / 10
        ) {
          scrollTo(maxTranslateY);
          playDragAnimation?.(maxTranslateY);
          return;
        }

        // scroll to start position if the user didn't pull enough
        if (active.value) {
          scrollTo(maxTranslateY);
          playDragAnimation?.(maxTranslateY);
        } else {
          scrollTo(0);
          playDragAnimation?.(0);
        }
      })
      .onFinalize(() => {
        scrollingState.value = true;
      });

    const rBottomSheetStyle = useAnimatedStyle(() => ({
      transform: [{translateY: translateY.value}],
    }));

    const onPressDragLine = () => {
      if (active.value) {
        scrollTo(0);
        playDragAnimation?.(0);
      } else {
        scrollTo(maxTranslateY);
        playDragAnimation?.(maxTranslateY);
      }
    };

    const scrollHandler = useAnimatedScrollHandler(({contentOffset}) => {
      scrollY.value = Math.round(contentOffset.y);
    });

    const isScrollEnabled = useDerivedValue(() => {
      return active.value && scrollingState.value;
    });

    return (
      <GestureDetector gesture={gesture}>
        <ReAnimated.View
          style={[styles.bottomSheetContainer, rBottomSheetStyle]}
          onLayout={e => setInitialYCoordinate(e.nativeEvent.layout.y)}>
          <Pressable onPress={onPressDragLine}>
            <View style={styles.line} />
          </Pressable>
          <AScrollView
            ref={scrollRef}
            scrollEnabled={isScrollEnabled}
            bounces={false}
            onScroll={scrollHandler}
            scrollEventThrottle={1}
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
