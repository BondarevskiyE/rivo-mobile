import React, {useState} from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import {initialWindowMetrics} from 'react-native-safe-area-context';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';

import {TABBAR_BOTTOM_OFFSET} from '@/navigation/components/TabBar';
import {Colors} from '@/shared/ui';
import {MenuModal} from './MenuModal';
import {DEPOSIT_WITHDRAWAL_MODAL_STEPS} from './types';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface Props {
  onCloseMenu: () => void;
}

export const DepositAndWithdrawalMenu: React.FC<Props> = ({onCloseMenu}) => {
  const [modalStep, setModalStep] = useState<DEPOSIT_WITHDRAWAL_MODAL_STEPS>(
    DEPOSIT_WITHDRAWAL_MODAL_STEPS.MENU,
  );

  return (
    <>
      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        style={styles.overlayContainer}>
        <View style={styles.overlay} />
      </Animated.View>
      <Animated.View style={styles.modal} entering={FadeIn} exiting={FadeOut}>
        <View style={styles.container}>
          <MenuModal
            onChangeModalStep={setModalStep}
            onCloseModal={onCloseMenu}
            step={modalStep}
          />
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,

    top: -(initialWindowMetrics?.insets.top || 0),
    bottom: -(initialWindowMetrics?.insets.bottom || 0),
  },
  overlay: {
    flex: 1,
    backgroundColor: Colors.ui_black,
    opacity: 0.8,
  },
  modal: {
    position: 'absolute',
    bottom:
      (initialWindowMetrics?.insets.bottom || 0) + TABBAR_BOTTOM_OFFSET + 48,
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
