import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
} from 'react-native';
import ReAnimated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {initialWindowMetrics} from 'react-native-safe-area-context';
import RNFadedScrollView from 'rn-faded-scrollview';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {OnboardingTasks} from '@/components/onboarding';
import {Header, CardWallet, CashAccount, StrategiesList} from './components';
import {HIGHLIGHT_ELEMENTS} from '@/store/useOnboardingStore';
import {
  ONBOARDING_MODAL_HEIGHT,
  openOnboardingModal,
} from '@/modal-manager/modals/OnboardingModal';
import {FLOAT_BOTTOM_MODAL_MARGIN} from '@/modal-manager';
import {useHighlightElementsWithScroll} from '@/shared/hooks';
import {OVERVIEW_SCREEN_CARD_HIDING_MARGIN} from '@/shared/constants/ui';

const {height} = Dimensions.get('window');

const SCROLL_PADDING_TOP = 20;
const DISTANCE_BETWEEN_ONBOARDING_MODAL_AND_HIGHLIGHT = 5;
const OFFSET_ONBOARDING_MODAL =
  ONBOARDING_MODAL_HEIGHT - DISTANCE_BETWEEN_ONBOARDING_MODAL_AND_HIGHLIGHT;

const HIGHLIGHT_OFFSET =
  ONBOARDING_MODAL_HEIGHT +
  DISTANCE_BETWEEN_ONBOARDING_MODAL_AND_HIGHLIGHT +
  FLOAT_BOTTOM_MODAL_MARGIN;

export const OverviewScreen = () => {
  const insets = useSafeAreaInsets();

  const [isHideCard, setIsHideCard] = useState(false);

  const cardAnimationValue = useSharedValue(1);

  // without insets.bottom onboarding modal takes height from scroll view and we need to calculate the new coordianate
  const insetBottomOffset = insets.bottom ? 0 : 33;
  const insetTopOffset =
    Platform.OS === 'android' ? initialWindowMetrics?.insets.top || 0 : 0;

  const {
    refs,
    scrollViewRef,
    scrollToOnboardingElement,
    onLayoutElement,
    onLayoutScrollView,
  } = useHighlightElementsWithScroll({
    elementsId: [
      HIGHLIGHT_ELEMENTS.CASH_ACCOUNT,
      HIGHLIGHT_ELEMENTS.STRATEGIES_LIST,
    ],
    // highlightOffset: HIGHLIGHT_OFFSET + (initialWindowMetrics?.insets.top || 0), // android
    highlightOffset: HIGHLIGHT_OFFSET + insetTopOffset,
    scrollOffset: OFFSET_ONBOARDING_MODAL + insetBottomOffset,
  });

  useEffect(() => {
    if (isHideCard) {
      cardAnimationValue.value = withTiming(0, {duration: 250});
      return;
    }
    cardAnimationValue.value = withTiming(1, {duration: 250});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHideCard]);

  const onHandleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;

    if (offsetY > 50 && !isHideCard) {
      setIsHideCard(true);
    }

    if (offsetY < 50 && isHideCard) {
      setIsHideCard(false);
    }
  };

  const cardScaleStyles = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          cardAnimationValue.value,
          [0, 1],
          [0.2, 1],
          Extrapolation.CLAMP,
        ),
      },
      {
        translateY: interpolate(
          cardAnimationValue.value,
          [0, 1],
          [-30, 0],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const scrollContainereStyles = useAnimatedStyle(() => ({
    marginTop: interpolate(
      cardAnimationValue.value,
      [0, 1],
      [OVERVIEW_SCREEN_CARD_HIDING_MARGIN, 0],
    ),
  }));

  const cardOpacityStyle = useAnimatedStyle(() => ({
    opacity: cardAnimationValue.value,
  }));

  const onClickOnboardingGuide = () => {
    openOnboardingModal({scrollToOnboardingElement});
  };

  return (
    <View style={styles.container}>
      <Header cardAnimationValue={cardAnimationValue} />
      <RNFadedScrollView
        allowStartFade
        allowEndFade={false} // FIX remove if the list will be higher
        horizontal={false}
        fadeSize={30}
        fadeColors={['rgba(248, 242, 239, 0)', 'rgba(248, 242, 239, 1)']}
        style={styles.scrollContainer}
        onScroll={onHandleScroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
        ref={scrollViewRef}
        onLayout={onLayoutScrollView}>
        <ReAnimated.View style={[styles.scrollArea, scrollContainereStyles]}>
          <ReAnimated.View
            style={[
              styles.cardWalletContainer,
              cardScaleStyles,
              cardOpacityStyle,
            ]}>
            <CardWallet />
          </ReAnimated.View>
          <OnboardingTasks onPressOnboarding={onClickOnboardingGuide} />

          <View
            style={styles.cashAccountContainer}
            ref={refs[HIGHLIGHT_ELEMENTS.CASH_ACCOUNT]}
            onLayout={onLayoutElement(HIGHLIGHT_ELEMENTS.CASH_ACCOUNT, {
              mode: 'rectangle',
              borderRadius: 24,
              clickthroughHighlight: false,
            })}>
            <CashAccount />
          </View>

          <View
            style={styles.strategiesListContainer}
            ref={refs[HIGHLIGHT_ELEMENTS.STRATEGIES_LIST]}
            onLayout={onLayoutElement(HIGHLIGHT_ELEMENTS.STRATEGIES_LIST, {
              mode: 'rectangle',
              borderRadius: 24,
              clickthroughHighlight: false,
            })}>
            <StrategiesList />
          </View>
        </ReAnimated.View>
      </RNFadedScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

    paddingTop: SCROLL_PADDING_TOP,
  },
  scrollContainer: {
    flex: 1,
    height,
    paddingHorizontal: 12,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  cardWalletContainer: {
    width: '73%',
    height: 156,
    alignSelf: 'center',
    marginTop: 63,
    marginBottom: 37,
    transformOrigin: 'top',
  },
  scrollArea: {
    paddingBottom: 350,
  },
  cashAccountContainer: {
    marginTop: 20,
  },
  strategiesListContainer: {
    marginTop: 12,
  },
});
