import React, {useEffect, useRef} from 'react';
import {Alert, Dimensions, StyleSheet} from 'react-native';
import ReAnimated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {initialWindowMetrics} from 'react-native-safe-area-context';

import {
  DragUpFromBottom,
  DragUpFromBottomRefProps,
} from '@/components/panGestureModals';
import {Strategy} from '@/shared/types';
import {AboutVaultContent} from './AboutVaultContent';
import {BUTTON_TYPE, Button} from '@/components/general/Button/Button';
import {Fonts} from '@/shared/ui';

const {width} = Dimensions.get('window');

interface Props {
  vault: Strategy;
  playDragAnimation: (value: number) => void;
  isBigCarouselContainer: boolean;
}

// below the screen
const INITIAL_TRANSLATE_Y = 600;

export const VaultAboutDragBlock: React.FC<Props> = ({
  vault,
  playDragAnimation,
  isBigCarouselContainer,
}) => {
  const positionValue = useSharedValue(70);
  const buttonShownValue = useSharedValue(0);
  const imageShiftValue = useSharedValue(0);

  const ref = useRef<DragUpFromBottomRefProps>(null);

  useEffect(() => {
    setTimeout(() => {
      ref?.current?.scrollTo(0);
    }, 100);
  }, []);

  useEffect(() => {
    positionValue.value = withTiming(isBigCarouselContainer ? 140 : 70);
    buttonShownValue.value = withTiming(isBigCarouselContainer ? 140 : 70);
  }, [buttonShownValue, isBigCarouselContainer, positionValue]);

  const onPlayDragAnimation = (value: number) => {
    'worklet';
    playDragAnimation(value);

    imageShiftValue.value = withSpring(value !== 0 ? 1 : 0, {
      stiffness: 180,
      damping: 30,
      mass: 1,
    });
  };

  const setIsInvestButtonShown = (isShown: boolean) => {
    const value = isBigCarouselContainer ? 140 : 70;

    buttonShownValue.value = withTiming(isShown ? value : 0);
  };

  const buttonStyles = useAnimatedStyle(() => {
    return {
      bottom: interpolate(
        buttonShownValue.value,
        [0, 70, 140],
        [
          -50,
          (initialWindowMetrics?.insets.bottom || 0) + 16,
          (initialWindowMetrics?.insets.bottom || 0) + 86,
        ],
      ),
    };
  });

  return (
    <ReAnimated.View style={[styles.container, {top: positionValue}]}>
      <DragUpFromBottom
        ref={ref}
        initialTranslateY={INITIAL_TRANSLATE_Y}
        translateYOffset={isBigCarouselContainer ? 70 : 0}
        playDragAnimation={onPlayDragAnimation}>
        <AboutVaultContent
          vault={vault}
          imageShiftValue={imageShiftValue}
          setIsInvestButtonShown={setIsInvestButtonShown}
        />
      </DragUpFromBottom>
      <ReAnimated.View style={[styles.buttonContainer, buttonStyles]}>
        <Button
          text="Invest"
          style={styles.investButton}
          textStyle={styles.investButtonText}
          type={BUTTON_TYPE.ACTION_SECONDARY}
          onPress={() => Alert.alert('invest!')}
        />
      </ReAnimated.View>
    </ReAnimated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    height: 0,
    top: 70,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    width: width - 12 - 12,
    left: 12,
    zIndex: 8,
  },
  investButton: {
    height: 56,
    borderRadius: 28,
  },
  investButtonText: {
    fontFamily: Fonts.bold,
    fontSize: 17,
  },
});
