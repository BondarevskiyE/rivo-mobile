import React, {useEffect, useRef} from 'react';
import {Dimensions, StyleSheet} from 'react-native';
import ReAnimated, {
  SharedValue,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {initialWindowMetrics} from 'react-native-safe-area-context';

import {
  DragUpFromBottom,
  DragUpFromBottomRefProps,
} from '@/components/panGestureModals';
import {Vault} from '@/shared/types';
import {AboutVaultContent} from './AboutVaultContent';
import {BUTTON_TYPE, Button} from '@/components/general/Button/Button';
import {Fonts} from '@/shared/ui';

// const Content = lazy(() => import('./AboutVaultContent'));

const {width} = Dimensions.get('window');

interface Props {
  vault: Vault;
  isBigCarouselContainer: boolean;
  dragAnimationValue: SharedValue<number>;
  openInvestForm: () => void;
}

// below the screen
const INITIAL_TRANSLATE_Y = 600;

const smallCarouselContainerPosition =
  (initialWindowMetrics?.insets.top || 0) + 10;
const bigCarouselContainerPosition = smallCarouselContainerPosition + 70;

export const VaultAboutDragBlock: React.FC<Props> = ({
  vault,
  dragAnimationValue,
  isBigCarouselContainer,
  openInvestForm,
}) => {
  const positionValue = useSharedValue(0);
  const buttonShownValue = useSharedValue(0);

  const ref = useRef<DragUpFromBottomRefProps>(null);

  useEffect(() => {
    setTimeout(() => {
      ref?.current?.scrollTo(0);
    }, 100);
  }, []);

  useEffect(() => {
    positionValue.value = withTiming(
      isBigCarouselContainer
        ? bigCarouselContainerPosition
        : smallCarouselContainerPosition,
    );
    buttonShownValue.value = withTiming(
      isBigCarouselContainer
        ? bigCarouselContainerPosition
        : smallCarouselContainerPosition,
    );
  }, [buttonShownValue, isBigCarouselContainer, positionValue]);

  const setIsInvestButtonShown = (isShown: boolean) => {
    const value = isBigCarouselContainer
      ? bigCarouselContainerPosition
      : smallCarouselContainerPosition;

    buttonShownValue.value = withTiming(isShown ? value : 0);
  };

  const buttonStyles = useAnimatedStyle(() => {
    return {
      bottom: interpolate(
        buttonShownValue.value,
        [0, smallCarouselContainerPosition, bigCarouselContainerPosition],
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
        translateYOffset={
          isBigCarouselContainer ? smallCarouselContainerPosition : 0
        }
        dragAnimationValue={dragAnimationValue}>
        {/* <Suspense fallback={<Text>Loading</Text>}>
          <Content
            vault={vault}
            imageShiftValue={carouselAnimation}
            setIsInvestButtonShown={setIsInvestButtonShown}
          />
        </Suspense> */}
        <AboutVaultContent
          vault={vault}
          imageShiftValue={dragAnimationValue}
          setIsInvestButtonShown={setIsInvestButtonShown}
        />
      </DragUpFromBottom>
      <ReAnimated.View style={[styles.buttonContainer, buttonStyles]}>
        <Button
          text="Invest"
          style={styles.investButton}
          textStyle={styles.investButtonText}
          type={BUTTON_TYPE.ACTION_SECONDARY}
          onPress={openInvestForm}
        />
      </ReAnimated.View>
    </ReAnimated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    height: 0,
    top: smallCarouselContainerPosition,
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
