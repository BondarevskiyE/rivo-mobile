import React, {useEffect} from 'react';
import {StyleSheet} from 'react-native';
import { BIOMETRY_TYPE } from 'react-native-keychain';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {BUTTON_TYPE, Button} from '@/components/general/Button/Button';
import {getActionButtonText, getAdditionalButtonText} from '../helpers';
import {Colors, Fonts} from '@/shared/ui';
import {SEND_TRANSACTION_FORM_TYPE, TRANSACTION_STATUS} from '../types';


const BUTTON_HEIGHT = 56;
const BUTTONS_GAP = 12;
const BUTTONS_CONTAINER_HEIGHT = BUTTON_HEIGHT * 2 + BUTTONS_GAP;

interface Props {
  onSendTx: () => void;
  onTryAgain: () => void;
  onCloseScreen: () => void;
  onGoToScanner: () => void;
  onGoToSupport: () => void;
  onSaveSlippage: () => void;
  isSlippageOpen: boolean;
  isInputEmpty: boolean;
  isEnoughBalance: boolean;
  isSendAddressEmpty: boolean;
  isSendAddressValid: boolean;
  isLoading: boolean;
  biometryType: BIOMETRY_TYPE | null;
  txStatus: TRANSACTION_STATUS;
  formType: SEND_TRANSACTION_FORM_TYPE;
  isDisabled: boolean;
}

export const ActionButtons: React.FC<Props> = ({
  onSendTx,
  onTryAgain,
  onCloseScreen,
  onGoToScanner,
  onGoToSupport,
  onSaveSlippage,
  isSlippageOpen,
  isInputEmpty,
  isEnoughBalance,
  isSendAddressEmpty,
  isSendAddressValid,
  isLoading,
  formType,
  biometryType,
  txStatus,
  isDisabled,
}) => {
  const animationValue = useSharedValue(BUTTON_HEIGHT);
  useEffect(() => {
    if (txStatus !== TRANSACTION_STATUS.NONE) {
      animationValue.value = withTiming(BUTTONS_CONTAINER_HEIGHT, {
        duration: 400,
      });
    } else {
      animationValue.value = withTiming(BUTTON_HEIGHT, {
        duration: 400,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txStatus]);

  const onPressActionButton = () => {
    if (isSlippageOpen) {
      onSaveSlippage();
      return;
    }

    if (txStatus === TRANSACTION_STATUS.SUCCESS) {
      onCloseScreen();
      return;
    }
    if (txStatus === TRANSACTION_STATUS.FAIL) {
      onTryAgain();
      return;
    }

    onSendTx();
  };

  const onPressAdditionalButton = () => {
    if (txStatus === TRANSACTION_STATUS.SUCCESS) {
      onGoToScanner();
      return;
    }
    if (txStatus === TRANSACTION_STATUS.FAIL) {
      onGoToSupport();
      return;
    }

    onSendTx();
  };

  const containerStyles = useAnimatedStyle(() => ({
    height: animationValue.value,
  }));

  const actionButtonText = getActionButtonText({
    isInputEmpty,
    isEnoughBalance,
    isSendAddressEmpty,
    isSendAddressValid,
    formType,
    isLoading,
    biometryType,
    txStatus,
    isSlippageOpen,
  });

  const additionalButtonText = getAdditionalButtonText(txStatus);

  const isError =
    (!isSlippageOpen &&
      txStatus === TRANSACTION_STATUS.NONE &&
      !isEnoughBalance) ||
    (formType === SEND_TRANSACTION_FORM_TYPE.SEND &&
      !isSendAddressEmpty &&
      !isSendAddressValid);

  return (
    <Animated.View style={[styles.container, containerStyles]}>
      <Button
        onPress={onPressActionButton}
        type={BUTTON_TYPE.ACTION_SECONDARY}
        text={actionButtonText}
        error={isError}
        style={styles.button}
        textStyle={styles.buttonText}
        disabled={txStatus === TRANSACTION_STATUS.NONE && isDisabled}
      />
      <Button
        onPress={onPressAdditionalButton}
        type={BUTTON_TYPE.ACTION_DARK}
        text={additionalButtonText}
        style={[styles.button]}
        textStyle={styles.additionalButtonText}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: BUTTONS_GAP,
    overflow: 'hidden',
  },
  button: {
    borderRadius: 40,
    height: BUTTON_HEIGHT,
  },
  buttonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 17,
    color: Colors.ui_white,
  },
  additionalButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 17,
    color: Colors.ui_orange_80,
  },
});
