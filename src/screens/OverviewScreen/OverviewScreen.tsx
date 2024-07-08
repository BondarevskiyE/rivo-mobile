import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ScrollView,
} from 'react-native';
import ReAnimated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {HighlightableElement} from 'react-native-highlight-overlay';
import RNFadedScrollView from 'rn-faded-scrollview';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {OnboardingTasks} from '@/components/onboarding';
import {Header, CardWallet, CashAccount, StrategiesList} from './components';
import {HIGHLIGHT_ELEMENTS} from '@/store/useOnboardingStore';
import {ONBOARDING_MODAL_HEIGHT} from '@/modal-manager/modals/OnboardingModal';

const {height} = Dimensions.get('window');

// 6 is gap between modal and view
const OFFSET_ONBOARDING_MODAL = ONBOARDING_MODAL_HEIGHT - 6;

export const OverviewScreen = () => {
  const insets = useSafeAreaInsets();

  // without insets.bottom onboarding modal takes height from scroll view and we need to calculate the new coordianate
  const insetOffset = insets.bottom ? 0 : 33;

  const scrollViewRef = useRef<ScrollView>(null);

  const [isHideCard, setIsHideCard] = useState(false);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);

  const cardAnimationValue = useSharedValue(1);

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

    if (!scrollViewHeight) {
      setScrollViewHeight(event.nativeEvent.layoutMeasurement.height);
    }

    if (offsetY > 100 && !isHideCard) {
      setIsHideCard(true);
    }

    if (offsetY < 100 && isHideCard) {
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

  const cardOpacityStyle = useAnimatedStyle(() => ({
    opacity: cardAnimationValue.value,
  }));

  return (
    <View style={{flex: 1}}>
      <Header cardAnimationValue={cardAnimationValue} />
      <RNFadedScrollView
        allowStartFade
        allowEndFade={false} // FIX remove if the list will be higher
        horizontal={false}
        fadeSize={30}
        fadeColors={['rgba(248, 242, 239, 0)', 'rgba(248, 242, 239, 1)']}
        style={styles.container}
        onScroll={onHandleScroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
        ref={scrollViewRef}>
        <View style={styles.scrollArea}>
          <ReAnimated.View
            style={[
              styles.cardWalletContainer,
              cardScaleStyles,
              cardOpacityStyle,
            ]}>
            <CardWallet />
          </ReAnimated.View>
          <OnboardingTasks />

          <HighlightableElement
            id={HIGHLIGHT_ELEMENTS.CASH_ACCOUNT}
            // scrollContainerRef - is a ref to scroll the list to the right position of view above the modal
            scrollContainerRef={scrollViewRef}
            scrollOffset={
              scrollViewHeight - OFFSET_ONBOARDING_MODAL - insetOffset
            }
            options={{
              mode: 'rectangle',
              borderRadius: 24,
              clickthroughHighlight: false,
            }}
            style={styles.cashAccountContainer}>
            <CashAccount />
          </HighlightableElement>

          <HighlightableElement
            id={HIGHLIGHT_ELEMENTS.STRATEGIES_LIST}
            scrollContainerRef={scrollViewRef}
            scrollOffset={
              scrollViewHeight - OFFSET_ONBOARDING_MODAL - insetOffset
            }
            options={{
              mode: 'rectangle',
              borderRadius: 24,
              clickthroughHighlight: false,
            }}
            style={styles.strategiesListContainer}>
            <StrategiesList />
          </HighlightableElement>
        </View>
      </RNFadedScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height,
    paddingHorizontal: 12,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  cardWalletContainer: {
    width: '73%',
    // height: 156,
    height: 'auto',
    alignSelf: 'center',
    marginVertical: 37,
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
