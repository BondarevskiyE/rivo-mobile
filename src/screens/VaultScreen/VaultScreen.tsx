import {Colors} from '@/shared/ui';
import React, {useCallback, useState} from 'react';
import {Dimensions, StyleSheet} from 'react-native';
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
import {SendTransactionForm} from '@/components/SendTransactionForm';
import {SEND_TRANSACTION_FORM_TYPE} from '@/components/SendTransactionForm/types';
import {useZeroDevStore} from '@/store/useZeroDevStore';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

type Props = StackScreenProps<HomeStackProps, HOME_SCREENS.VAULT_SCREEN>;

export const VaultScreen: React.FC<Props> = ({route, navigation}) => {
  const {vaultId} = route.params;

  const [isBigCarouselContainer, setIsBigCarouselContainer] =
    useState<boolean>(false);

  const [isInvestFormOpen, setIsInvetFormOpen] = useState<boolean>(false);

  const invest = useZeroDevStore(state => state.invest);

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

  return (
    <SafeAreaView style={styles.container}>
      {isInvestFormOpen && (
        <ReAnimated.View style={[styles.investForm, investFormStyle]}>
          <SendTransactionForm
            vault={vaultById}
            onSendTransaction={invest}
            onCloseForm={closeInvestForm}
            onCloseScreen={goBack}
            formType={SEND_TRANSACTION_FORM_TYPE.INVEST}
          />
        </ReAnimated.View>
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
          dragAnimationValue={carouselValue}
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
    // paddingTop: 10,
  },
  dragBlockContainer: {
    position: 'relative',

    zIndex: 3,
  },
  investForm: {
    position: 'absolute',
    width: '100%',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: initialWindowMetrics?.insets.top,
    paddingBottom: initialWindowMetrics?.insets.bottom,
    height: SCREEN_HEIGHT,
    zIndex: 1,
  },
});
