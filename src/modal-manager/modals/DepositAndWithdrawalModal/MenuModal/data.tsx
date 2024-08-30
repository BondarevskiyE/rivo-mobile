import React from 'react';
import {StyleSheet, View} from 'react-native';

import {DEPOSIT_WITHDRAWAL_MODAL_STEPS} from '../types';
import {PlusIcon} from '@/shared/ui/icons';
import {Colors} from '@/shared/ui';
import {FullArrowIcon} from '@/shared/ui/icons/FullArrowIcon';
import {BankCardIcon} from '@/shared/ui/icons/BankCardIcon';
import {QRIcon} from '@/shared/ui/icons/QRIcon';
import {BilateralArrowIcon} from '@/shared/ui/icons/BilateralArrowIcon';
import {PaperPlaneIcon} from '@/shared/ui/icons/PaperPlaneIcon';

interface ModalButton {
  title: string;
  text: string;
  actionStep: DEPOSIT_WITHDRAWAL_MODAL_STEPS;
  Icon: React.ReactNode;
  withArrow?: boolean;
}

interface ModalStep {
  withProtectedShield: boolean;
  buttons: ModalButton[];
  title?: string;
  backAction?: DEPOSIT_WITHDRAWAL_MODAL_STEPS;
}

type Data = {
  [key in DEPOSIT_WITHDRAWAL_MODAL_STEPS]?: ModalStep;
};

const styles = StyleSheet.create({
  iconContainer: {
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export const data: Data = {
  [DEPOSIT_WITHDRAWAL_MODAL_STEPS.MENU]: {
    withProtectedShield: true,
    buttons: [
      {
        title: 'Top up balance, 0% fee',
        text: 'Purchase, receive or bridge to Rivo',
        Icon: (
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: Colors.ui_orange_22,
              },
            ]}>
            <PlusIcon color={Colors.ui_orange_80} width={15} height={15} />
          </View>
        ),
        actionStep: DEPOSIT_WITHDRAWAL_MODAL_STEPS.DEPOSIT,
        withArrow: true,
      },
      {
        title: 'Withdraw',
        text: 'Sell, send or bridge from Rivo',
        Icon: (
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: Colors.ui_orange_22,
              },
            ]}>
            <FullArrowIcon color={Colors.ui_orange_80} width={15} height={15} />
          </View>
        ),
        actionStep: DEPOSIT_WITHDRAWAL_MODAL_STEPS.WITHDRAWAL,
        withArrow: true,
      },
    ],
  },
  [DEPOSIT_WITHDRAWAL_MODAL_STEPS.DEPOSIT]: {
    withProtectedShield: true,
    title: 'Top up your balance with 0% fees',
    backAction: DEPOSIT_WITHDRAWAL_MODAL_STEPS.MENU,
    buttons: [
      {
        title: 'Purchase',
        text: 'If you are new to crypto',
        Icon: (
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: Colors.ui_green_10,
              },
            ]}>
            <BankCardIcon color={Colors.ui_green_52} width={17} height={12} />
          </View>
        ),
        actionStep: DEPOSIT_WITHDRAWAL_MODAL_STEPS.PURCHASE,
      },
      {
        title: 'Receive USDC on Arbitrum',
        text: 'If you already have some USDC on Arbitrum',
        Icon: (
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: Colors.ui_blue_10,
              },
            ]}>
            <QRIcon color={Colors.ui_blue_50} width={17} height={14} />
          </View>
        ),
        actionStep: DEPOSIT_WITHDRAWAL_MODAL_STEPS.RECEIVE,
      },
      {
        title: 'Swap or Bridge to USDC to Arbitrum',
        text: 'If you already have crypto on other wallets',
        Icon: (
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: Colors.ui_purple_10,
              },
            ]}>
            <BilateralArrowIcon
              color={Colors.ui_purple_50}
              width={17}
              height={12}
            />
          </View>
        ),
        actionStep: DEPOSIT_WITHDRAWAL_MODAL_STEPS.SWAP_OR_BRIDGE,
      },
    ],
  },
  [DEPOSIT_WITHDRAWAL_MODAL_STEPS.WITHDRAWAL]: {
    withProtectedShield: false,
    title: 'Withdraw your crypto',
    backAction: DEPOSIT_WITHDRAWAL_MODAL_STEPS.MENU,
    buttons: [
      {
        title: 'Sell crypto',
        text: 'Receive funds on your bank card, apple pay',
        Icon: (
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: Colors.ui_green_10,
              },
            ]}>
            <BankCardIcon color={Colors.ui_green_52} width={17} height={12} />
          </View>
        ),
        actionStep: DEPOSIT_WITHDRAWAL_MODAL_STEPS.SELL,
      },
      {
        title: 'Send USDC on Arbitrum',
        text: 'Send funds to your wallet',
        Icon: (
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: Colors.ui_blue_10,
              },
            ]}>
            <PaperPlaneIcon width={15} height={17} />
          </View>
        ),
        actionStep: DEPOSIT_WITHDRAWAL_MODAL_STEPS.SEND,
      },
      {
        title: 'Swap or Bridge to USDC to Arbitrum',
        text: 'If you already have crypto on other wallets',
        Icon: (
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: Colors.ui_purple_10,
              },
            ]}>
            <BilateralArrowIcon
              color={Colors.ui_purple_50}
              width={17}
              height={12}
            />
          </View>
        ),
        actionStep: DEPOSIT_WITHDRAWAL_MODAL_STEPS.SWAP_OR_BRIDGE,
      },
    ],
  },
};
