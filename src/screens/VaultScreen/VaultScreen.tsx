import {Colors} from '@/shared/ui';
import React, {useCallback, useState} from 'react';
import {StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import ReAnimated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import {StackScreenProps} from '@react-navigation/stack';
import {VaultAboutDragBlock, VaultVerticalCarousel} from './components';
import {useStrategiesStore} from '@/store/useStrategiesStore';
import {Strategy} from '@/shared/types';
import {HOME_SCREENS, HomeStackProps} from '@/navigation/types/homeStack';

type Props = StackScreenProps<HomeStackProps, HOME_SCREENS.VAULT_SCREEN>;

export const VaultScreen: React.FC<Props> = ({route, navigation}) => {
  const {vaultId} = route.params;

  const [isBigCarouselContainer, setIsBigCarouselContainer] = useState(false);

  const carouselValue = useSharedValue(0);

  const strategyById = useStrategiesStore(
    useCallback(
      state => state.strategies.find(item => item.id === vaultId),
      [vaultId],
    ),
    // there couldn't be undefined
  ) as Strategy;

  const goBack = () => {
    navigation.goBack();
  };

  // smooth prop enables withTiming, it is here for clicking open/close button without draging
  const playCarouselScaleOutAnimation = (value: number, smooth?: boolean) => {
    'worklet';

    if (smooth) {
      carouselValue.value = withTiming(value, {
        easing: Easing.inOut(Easing.linear),
      });
      return;
    }

    carouselValue.value = value;
  };

  const carouselStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          carouselValue.value,
          [0, -400],
          [1, 0.95],
          Extrapolation.CLAMP,
        ),
      },
    ],
    opacity: interpolate(
      carouselValue.value,
      [0, -400],
      [1, 0.5],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <SafeAreaView style={styles.container}>
      <ReAnimated.View style={[styles.carouselContainer, carouselStyle]}>
        <VaultVerticalCarousel
          vault={strategyById}
          goBack={goBack}
          changeDragBlockSize={setIsBigCarouselContainer}
          isBigCarouselContainer={isBigCarouselContainer}
        />
      </ReAnimated.View>
      <VaultAboutDragBlock
        vault={strategyById}
        playDragAnimation={playCarouselScaleOutAnimation}
        isBigCarouselContainer={isBigCarouselContainer}
        carouselAnimation={carouselValue}
      />
    </SafeAreaView>
  );
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ui_black,
  },
  carouselContainer: {
    flex: 1,
  },
});
