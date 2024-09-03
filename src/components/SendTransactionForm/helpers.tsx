import React from 'react';
import {Text, View} from 'react-native';

import {isFaceBiometry} from '@/services/keychain';
import {FaceIdIcon} from '@/shared/ui/icons';
import {Colors, Fonts} from '@/shared/ui';
import {BIOMETRY_TYPE} from 'react-native-keychain';
import {TouchIdIcon} from '@/shared/ui/icons/TouchIdIcon';
import {
  SEND_TRANSACTION_FORM_TYPE,
  TEXT_SIGN_POSITION,
  TRANSACTION_STATUS,
} from './types';

export const getInputFontSize = (inputLength: number) => {
  if (inputLength > 10) {
    return 32;
  }

  if (inputLength > 5) {
    return 48;
  }

  return 64;
};

interface GetActionButtonTextParams {
  isInputEmpty: boolean;
  isEnoughBalance: boolean;
  isSendAddressEmpty: boolean;
  isSendAddressValid: boolean;
  isLoading: boolean;
  formType: SEND_TRANSACTION_FORM_TYPE;
  biometryType: BIOMETRY_TYPE | null;
  txStatus: TRANSACTION_STATUS;
  isSlippageOpen: boolean;
}

export const getActionButtonText = ({
  isInputEmpty,
  isEnoughBalance,
  isSendAddressEmpty,
  isSendAddressValid,
  formType,
  isLoading,
  biometryType,
  txStatus,
  isSlippageOpen,
}: GetActionButtonTextParams) => {
  if (isSlippageOpen) {
    return 'Save';
  }

  if (isLoading) {
    return 'Processing...';
  }

  if (txStatus === TRANSACTION_STATUS.SUCCESS) {
    return 'Close';
  }

  if (txStatus === TRANSACTION_STATUS.FAIL) {
    return 'Try to repeat';
  }

  if (isInputEmpty) {
    return 'Enter Amount';
  }

  if (!isEnoughBalance) {
    return 'Insufificient balance';
  }

  if (formType === SEND_TRANSACTION_FORM_TYPE.SEND) {
    if (!isInputEmpty && isSendAddressEmpty) {
      return 'Paste or scan address';
    }

    if (!isSendAddressEmpty && !isSendAddressValid) {
      return 'Invalid address';
    }
  }

  if (biometryType) {
    const isFaceBiometryType = isFaceBiometry(biometryType);

    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 12,
        }}>
        {isFaceBiometryType ? (
          <FaceIdIcon color={Colors.ui_white} width={20} height={20} />
        ) : (
          <TouchIdIcon color={Colors.ui_white} width={20} height={20} />
        )}
        <Text
          style={{
            fontFamily: Fonts.semiBold,
            fontSize: 17,
            color: Colors.ui_white,
          }}>
          Confirm
        </Text>
      </View>
    );
  }

  return 'Confirm';
};

export const getAdditionalButtonText = (txStatus: TRANSACTION_STATUS) => {
  return txStatus === TRANSACTION_STATUS.SUCCESS
    ? 'View on Blockchain'
    : 'Contact support';
};

export const getTextSignPositionStyles = (position?: TEXT_SIGN_POSITION) => {
  switch (position) {
    case TEXT_SIGN_POSITION.UP_LEFT:
      return {
        left: -18,

        fontSize: 24,
      };
    case TEXT_SIGN_POSITION.RIGHT:
      return {
        right: -54,
        fontSize: 64,
      };

    default:
      return {};
  }
};

export const getTitleText = (
  formType: SEND_TRANSACTION_FORM_TYPE,
  isSlippageOpen: boolean,
) => {
  if (isSlippageOpen) {
    return 'Invest slippage';
  }

  if (formType === SEND_TRANSACTION_FORM_TYPE.INVEST) {
    return 'Invest';
  }

  if (formType === SEND_TRANSACTION_FORM_TYPE.WITHDRAW) {
    return 'Withdraw';
  }

  if (formType === SEND_TRANSACTION_FORM_TYPE.SEND) {
    return 'Send';
  }

  return '';
};
