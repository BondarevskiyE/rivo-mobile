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

import {Header} from './components';
import {CardWallet} from '@/components';
import {OnboardingTasks} from '@/components/onboarding';
import {CashAccount, StrategiesList} from './components';

const {height} = Dimensions.get('window');

export const OverviewScreen = () => {
  const [isHideCard, setIsHideCard] = useState(false);

  const cardAnimationValue = useSharedValue(1);

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

  useEffect(() => {
    if (isHideCard) {
      cardAnimationValue.value = withTiming(0, {duration: 200});
      return;
    }
    cardAnimationValue.value = withTiming(1, {duration: 200});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHideCard]);

  const cardHeightStyle = useAnimatedStyle(() => {
    const interpolatedHeight = interpolate(
      cardAnimationValue.value,
      [0, 1],
      [0, 25],
      {extrapolateRight: Extrapolation.CLAMP},
    );
    const interpolatedMarginTop = interpolate(
      cardAnimationValue.value,
      [0, 1],
      [0, 40],
      {extrapolateRight: Extrapolation.CLAMP},
    );
    return {
      height: `${interpolatedHeight}%`,
      marginTop: interpolatedMarginTop,
    };
  });

  return (
    <>
      <Header cardAnimationValue={cardAnimationValue} />

      <ReAnimated.ScrollView
        style={styles.container}
        onScroll={onHandleScroll}
        bounces={false}>
        <View style={styles.scroll}>
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
      </ReAnimated.ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height,
    paddingHorizontal: 12,
  },
  cardWalletContainer: {
    width: '73%',
    alignSelf: 'center',
    // marginBottom: 40,
    // paddingTop: 20,
    marginVertical: 40,
    transformOrigin: 'top',
  },
  scroll: {
    paddingBottom: 100,
  },
});
