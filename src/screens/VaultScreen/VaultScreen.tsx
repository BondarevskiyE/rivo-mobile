import {Colors} from '@/shared/ui';
import React, {useCallback, useState} from 'react';
import {Pressable, StyleSheet} from 'react-native';
import {
  SafeAreaView,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import ReAnimated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

import {StackScreenProps} from '@react-navigation/stack';
import {VaultAboutDragBlock, VaultVerticalCarousel} from './components';
import {useVaultsStore} from '@/store/useVaultsStore';
import {Vault} from '@/shared/types';
import {HOME_SCREENS, HomeStackProps} from '@/navigation/types/homeStack';
import {InvestForm} from './components/InvestForm';
import {ArrowLineIcon} from '@/shared/ui/icons';

const AnimatedPressable = ReAnimated.createAnimatedComponent(Pressable);

type Props = StackScreenProps<HomeStackProps, HOME_SCREENS.VAULT_SCREEN>;

export const VaultScreen: React.FC<Props> = ({route, navigation}) => {
  const {vaultId} = route.params;

  const [isBigCarouselContainer, setIsBigCarouselContainer] =
    useState<boolean>(false);
  const [isInvestFormOpen, setIsInvetFormOpen] = useState<boolean>(false);

  const investScreenValue = useSharedValue(0);

  const carouselValue = useSharedValue(0);

  const vaultById = useVaultsStore(
    useCallback(
      state => state.vaults.find(item => item.id === vaultId),
      [vaultId],
    ),
    // there couldn't be undefined
  ) as Vault;

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
      {
        translateY: interpolate(investScreenValue.value, [0, 1], [0, -1000]),
      },
    ],
    opacity: interpolate(
      carouselValue.value,
      [0, -400],
      [1, 0.5],
      Extrapolation.CLAMP,
    ),
  }));

  const playInvestFormAnimation = (isOpen: boolean) => {
    // if it is open animation we need to show form before the animation
    if (isOpen) {
      runOnJS(setIsInvetFormOpen)(isOpen);
    }
    investScreenValue.value = withTiming(
      isOpen ? 1 : 0,
      {
        duration: 600,
        easing: Easing.inOut(Easing.quad),
      },
      // if it is close animation we need to hide form only after the animation
      () => !isOpen && runOnJS(setIsInvetFormOpen)(isOpen),
    );
  };

  const openInvestForm = () => {
    playInvestFormAnimation(true);
  };

  const closeInvestForm = () => {
    playInvestFormAnimation(false);
  };

  const investFormStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          investScreenValue.value,
          [0, 1],
          [0.9, 1],
          Extrapolation.CLAMP,
        ),
      },
    ],
    opacity: investScreenValue.value,
  }));

  const dragBlockStyle = useAnimatedStyle(() => ({
    bottom: interpolate(investScreenValue.value, [0, 1], [0, -1000]),
  }));

  const investFormBackButtonStyle = useAnimatedStyle(() => ({
    opacity: investScreenValue.value,
  }));

  return (
    <SafeAreaView style={styles.container}>
      {isInvestFormOpen && (
        <>
          <AnimatedPressable
            style={[styles.backIconContainer, investFormBackButtonStyle]}
            onPress={closeInvestForm}>
            <ArrowLineIcon color={Colors.ui_white} />
          </AnimatedPressable>

          <ReAnimated.View style={[styles.investForm, investFormStyle]}>
            <InvestForm vault={vaultById} />
          </ReAnimated.View>
        </>
      )}
      <ReAnimated.View style={[styles.carouselContainer, carouselStyle]}>
        <VaultVerticalCarousel
          vault={vaultById}
          goBack={goBack}
          changeDragBlockSize={setIsBigCarouselContainer}
          isBigCarouselContainer={isBigCarouselContainer}
        />
      </ReAnimated.View>

      <ReAnimated.View style={[styles.dragBlockContainer, dragBlockStyle]}>
        <VaultAboutDragBlock
          vault={vaultById}
          playDragAnimation={playCarouselScaleOutAnimation}
          isBigCarouselContainer={isBigCarouselContainer}
          carouselAnimation={carouselValue}
          openInvestForm={openInvestForm}
        />
      </ReAnimated.View>
    </SafeAreaView>
  );
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ui_black,
    position: 'relative',
  },
  carouselContainer: {
    position: 'relative',
    flex: 1,
    zIndex: 2,
  },
  dragBlockContainer: {
    position: 'relative',

    zIndex: 3,
  },
  investForm: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: initialWindowMetrics?.insets.top,
    paddingBottom: initialWindowMetrics?.insets.bottom,
    zIndex: 1,
  },
  backIconContainer: {
    position: 'absolute',
    top: (initialWindowMetrics?.insets.top || 0) + 12,
    left: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    backgroundColor: Colors.ui_black_65,
    borderRadius: 18,
    zIndex: 3,
    transform: [
      {
        rotate: '180deg',
      },
    ],
  },
});
