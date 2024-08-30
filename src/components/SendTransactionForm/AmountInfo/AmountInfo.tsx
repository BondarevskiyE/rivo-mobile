import React from 'react';
import {Text, StyleSheet} from 'react-native';
import Animated from 'react-native-reanimated';

import {Colors, Fonts} from '@/shared/ui';
import {InvestEstimate} from '../InvestEstimate';
import {SEND_TRANSACTION_FORM_TYPE} from '../types';
import {fadeScaleEntering} from '@/customAnimations/fadeScaleEntering';
import {fadeScaleExiting} from '@/customAnimations/fadeScaleExiting';

interface Props {
  investValue: string;
  isSlippageOpen: boolean;
  formType: SEND_TRANSACTION_FORM_TYPE;
  apy: number;
}

export const AmountInfo: React.FC<Props> = ({
  investValue,
  formType,
  apy,
  isSlippageOpen,
}) => {
  if (isSlippageOpen) {
    return (
      <Animated.View
        style={styles.textContainer}
        entering={fadeScaleEntering}
        exiting={fadeScaleExiting}>
        <Text style={styles.text}>
          Your invest will revert if the price changes more that this percentage
        </Text>
      </Animated.View>
    );
  }

  if (formType === SEND_TRANSACTION_FORM_TYPE.INVEST) {
    return <InvestEstimate value={investValue} apy={apy} />;
  }

  if (formType === SEND_TRANSACTION_FORM_TYPE.WITHDRAW) {
    return (
      <Animated.View
        entering={fadeScaleEntering}
        exiting={fadeScaleExiting}
        style={styles.textContainer}>
        <Text style={styles.text}>
          Funds will be deposited to your Rivo’s Cash Account
        </Text>
      </Animated.View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 88,
  },
  text: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.ui_grey_55,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
