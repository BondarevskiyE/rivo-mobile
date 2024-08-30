import React, {useEffect, useState} from 'react';
import {Dimensions, Pressable, StyleSheet, View} from 'react-native';
import {initialWindowMetrics} from 'react-native-safe-area-context';
import Animated, {
  Extrapolation,
  FadeOut,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import {Modal} from '@/modal-manager/Modal';
import {TABBAR_BOTTOM_OFFSET} from '@/navigation/components/TabBar';
import {Colors} from '@/shared/ui';
import {PlusIcon} from '@/shared/ui/icons';
import {MenuModal} from './MenuModal';
import {DEPOSIT_WITHDRAWAL_MODAL_STEPS} from './types';
import {ReceiveScreen} from './ReceiveScreen';
import {SendScreen} from './SendScreen';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface Props {
  onCloseModal: () => void;
}

export const DepositAndWithdrawalModal: React.FC<Props> = ({onCloseModal}) => {
  const closeButtonValue = useSharedValue(0);

  const [modalStep, setModalStep] = useState<DEPOSIT_WITHDRAWAL_MODAL_STEPS>(
    DEPOSIT_WITHDRAWAL_MODAL_STEPS.MENU,
  );

  useEffect(() => {
    closeButtonValue.value = withSpring(1, {
      stiffness: 90,
      damping: 20,
      mass: 1,
    });
  }, [closeButtonValue]);

  const goBackToDepositMenu = () => {
    setModalStep(DEPOSIT_WITHDRAWAL_MODAL_STEPS.DEPOSIT);
  };

  const goBackToWithdrawaltMenu = () => {
    setModalStep(DEPOSIT_WITHDRAWAL_MODAL_STEPS.WITHDRAWAL);
  };

  const closeButtonScaleStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scaleX: interpolate(
          closeButtonValue.value,
          [0, 0.9, 1],
          [1, 0.9, 1],
          Extrapolation.EXTEND,
        ),
      },
      {
        rotate: '45deg',
      },
    ],
  }));

  const isModalMenuOpen =
    modalStep === DEPOSIT_WITHDRAWAL_MODAL_STEPS.MENU ||
    modalStep === DEPOSIT_WITHDRAWAL_MODAL_STEPS.DEPOSIT ||
    modalStep === DEPOSIT_WITHDRAWAL_MODAL_STEPS.WITHDRAWAL;

  return (
    <>
      {modalStep === DEPOSIT_WITHDRAWAL_MODAL_STEPS.RECEIVE && (
        <ReceiveScreen onClose={goBackToDepositMenu} />
      )}
      {modalStep === DEPOSIT_WITHDRAWAL_MODAL_STEPS.SEND && (
        <SendScreen onClose={goBackToWithdrawaltMenu} />
      )}
      {isModalMenuOpen && (
        <Animated.View
          style={modalStyles.modal}
          exiting={FadeOut.duration(500)}>
          <View style={modalStyles.container}>
            <MenuModal
              onChangeModalStep={setModalStep}
              onCloseModal={onCloseModal}
              step={modalStep}
            />
          </View>

          <AnimatedPressable
            onPress={onCloseModal}
            style={[modalStyles.plusIconContainer, closeButtonScaleStyle]}>
            <Animated.View style={[modalStyles.plusIcon]}>
              <PlusIcon />
            </Animated.View>
          </AnimatedPressable>
        </Animated.View>
      )}
    </>
  );
};

interface OpenModalParams {
  onHide: () => void;
}

export const openDepositAndWithdrawalModal = ({onHide}: OpenModalParams) => {
  const onCloseModal = () => {
    Modal.hide();
    onHide();
  };

  Modal.show({
    children: <DepositAndWithdrawalModal onCloseModal={onCloseModal} />,
    dismissable: false,
    position: 'bottom',
    animationIn: 'fadeIn',
    animationOut: 'fadeOut',
    backdropOpacity: 0.8,
  });
};

const modalStyles = StyleSheet.create({
  modal: {
    position: 'absolute',
    bottom:
      (initialWindowMetrics?.insets.bottom || 0) + TABBAR_BOTTOM_OFFSET + 27,
    left: 6,

    zIndex: 2,
  },
  container: {
    borderRadius: 24,
    width: SCREEN_WIDTH - 12,
    overflow: 'hidden',
  },
  plusIconContainer: {
    position: 'relative',
    bottom: -24,
    zIndex: 2,
    width: 48,
    height: 48,
    margin: 'auto',
    transform: [
      {
        rotate: '45deg',
      },
    ],
  },
  plusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.ui_orange_80,
  },
});
