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
import {useBalanceStore} from '@/store/useBalanceStore';
import {isSmallScreenDeviceWidth} from '@/shared/lib/screen';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface Props {
  vault: Vault;
  isBigCarouselContainer: boolean;
  dragAnimationValue: SharedValue<number>;
  openInvestForm: () => void;
  openWithdrawForm: () => void;
}

// below the screen
const INITIAL_TRANSLATE_Y = 600;

const smallCarouselContainerPosition =
  (initialWindowMetrics?.insets.top || 0) +
  (isSmallScreenDeviceWidth ? 25 : 10);
const bigCarouselContainerPosition = smallCarouselContainerPosition + 70;

export const VaultAboutDragBlock: React.FC<Props> = ({
  vault,
  dragAnimationValue,
  isBigCarouselContainer,
  openInvestForm,
  openWithdrawForm,
}) => {
  const indexBalance = useBalanceStore(
    state => state.indexesBalanceMap?.[vault.address.toLowerCase()],
  );

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
          (initialWindowMetrics?.insets.bottom || 0) + 22,
          (initialWindowMetrics?.insets.bottom || 0) + 92,
        ],
      ),
    };
  });

  const isIndexWithBalance = !!indexBalance?.usd;

  return (
    <ReAnimated.View style={[styles.container, {top: positionValue}]}>
      <DragUpFromBottom
        ref={ref}
        initialTranslateY={INITIAL_TRANSLATE_Y}
        translateYOffset={
          isBigCarouselContainer ? smallCarouselContainerPosition : 0
        }
        dragAnimationValue={dragAnimationValue}>
        <AboutVaultContent
          vault={vault}
          imageShiftValue={dragAnimationValue}
          setIsInvestButtonShown={setIsInvestButtonShown}
          openInvestForm={openInvestForm}
          openWithdrawForm={openWithdrawForm}
        />
      </DragUpFromBottom>
      <ReAnimated.View style={[styles.buttonContainer, buttonStyles]}>
        <Button
          text="Invest"
          style={[
            styles.sendTxButton,
            isIndexWithBalance
              ? styles.halfWidthButton
              : styles.fullWidthButton,
          ]}
          textStyle={styles.sendTxButtonText}
          type={BUTTON_TYPE.ACTION_SECONDARY}
          onPress={openInvestForm}
        />
        {isIndexWithBalance && (
          <Button
            text="Withdraw"
            style={[styles.sendTxButton, styles.halfWidthButton]}
            textStyle={styles.sendTxButtonText}
            type={BUTTON_TYPE.ACTION}
            onPress={openWithdrawForm}
          />
        )}
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
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: SCREEN_WIDTH - 12 - 12,
    gap: 4,
    // left: 12,
    zIndex: 8,
  },
  fullWidthButton: {
    width: SCREEN_WIDTH - 24,
  },
  halfWidthButton: {
    width: SCREEN_WIDTH / 2 - 12,
  },
  sendTxButton: {
    height: 56,
    flex: 1,
    borderRadius: 28,
  },
  sendTxButtonText: {
    fontFamily: Fonts.bold,
    fontSize: 17,
  },
});
