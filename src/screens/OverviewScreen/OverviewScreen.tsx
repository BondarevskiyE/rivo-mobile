import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import ReAnimated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import RNFadedScrollView from 'rn-faded-scrollview';

import {OnboardingTasks} from '@/components/onboarding';
import {Header, CardWallet, CashAccount, StrategiesList} from './components';

const {height} = Dimensions.get('window');

export const OverviewScreen = () => {
  const [isHideCard, setIsHideCard] = useState(false);

  const cardAnimationValue = useSharedValue(1);

  useEffect(() => {
    if (isHideCard) {
      cardAnimationValue.value = withTiming(0, {duration: 200});
      return;
    }
    cardAnimationValue.value = withTiming(1, {duration: 200});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHideCard]);

  const onHandleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;

    if (!!offsetY && !isHideCard) {
      setIsHideCard(true);
    }

    if (offsetY === 0) {
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

  const cardHeightStyle = useAnimatedStyle(() => {
    const interpolatedHeight = interpolate(
      cardAnimationValue.value,
      [0, 1],
      [0, 156],
      {extrapolateRight: Extrapolation.CLAMP},
    );
    const interpolatedMarginTop = interpolate(
      cardAnimationValue.value,
      [0, 1],
      [0, 40],
      {extrapolateRight: Extrapolation.CLAMP},
    );
    return {
      height: interpolatedHeight,
      marginTop: interpolatedMarginTop,
    };
  });

  return (
    <View style={{flex: 1}}>
      <Header cardAnimationValue={cardAnimationValue} />
      <RNFadedScrollView
        allowStartFade={false}
        allowEndFade={false} // FIX remove if the list will be wider
        horizontal={false}
        fadeSize={30}
        fadeColors={['rgba(248, 242, 239, 0)', 'rgba(248, 242, 239, 1)']}
        style={styles.container}
        onScroll={onHandleScroll}
        showsVerticalScrollIndicator={false}
        bounces={false}>
        <View style={styles.scrollArea}>
          <ReAnimated.View
            style={[
              styles.cardWalletContainer,
              cardScaleStyles,
              cardOpacityStyle,
              cardHeightStyle,
            ]}>
            <CardWallet />
          </ReAnimated.View>
          <OnboardingTasks />
          <CashAccount />
          <StrategiesList />
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
    alignSelf: 'center',
    marginVertical: 40,
    transformOrigin: 'top',
  },
  scrollArea: {
    paddingBottom: 250,
  },
});
