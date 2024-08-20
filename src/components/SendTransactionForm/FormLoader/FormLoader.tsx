import React, {useEffect, useState} from 'react';
import {Dimensions, StyleSheet, Text, View} from 'react-native';

import {TRANSACTION_STATUS} from '../types';
import {Fonts} from '@/shared/ui';
import {getLoaderBackgroundColor, getLoaderTextColor} from './helpers';
import {LoaderIcon} from './LoaderIcon';
import {ConfettiAnimation} from '@/shared/ui/lottie';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

interface Props {
  isLoading: boolean;
  txStatus: TRANSACTION_STATUS;
  isInvest: boolean;
}

const LOADER_TEXT = {
  LOADING: 'Just a moment',
  LONG_WAITING: 'It may take some time',
  SUCCESS_INVEST: 'Invest completed',
  SUCCESS_WITHDRAW: 'Invest completed',
  FAIL_INVEST: 'Failed to invest',
  FAIL_WITHDRAW: 'Failed to withdraw',
};

const LONG_WAITING_TIMEOUT = 10000;

export const FormLoader: React.FC<Props> = ({
  isLoading,
  txStatus,
  isInvest,
}) => {
  const [text, setText] = useState(LOADER_TEXT.LOADING);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        setText(LOADER_TEXT.LONG_WAITING);
      }
    }, LONG_WAITING_TIMEOUT);

    return () => {
      clearInterval(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    switch (txStatus) {
      case TRANSACTION_STATUS.SUCCESS: {
        const successText = isInvest
          ? LOADER_TEXT.SUCCESS_INVEST
          : LOADER_TEXT.SUCCESS_WITHDRAW;
        setText(successText);
        break;
      }
      case TRANSACTION_STATUS.FAIL: {
        const failText = isInvest
          ? LOADER_TEXT.FAIL_INVEST
          : LOADER_TEXT.FAIL_WITHDRAW;
        setText(failText);
        break;
      }
      default:
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txStatus]);

  const textColor = getLoaderTextColor(txStatus);
  const loaderBackgroundColor = getLoaderBackgroundColor(txStatus);

  return (
    <View style={styles.container}>
      {txStatus === TRANSACTION_STATUS.SUCCESS && (
        <View style={styles.successConfetti}>
          <ConfettiAnimation loop={false} />
        </View>
      )}
      <View
        style={[
          styles.loaderContainer,
          {backgroundColor: loaderBackgroundColor},
        ]}>
        <LoaderIcon txStatus={txStatus} />
      </View>
      <Text style={[styles.text, {color: textColor}]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',

    width: 56,
    height: 56,
    borderRadius: 28,

    marginBottom: 12,
  },
  text: {
    fontFamily: Fonts.regular,
    fontSize: 14,
  },
  successConfetti: {
    position: 'absolute',
    top: -200,
    bottom: 0,
    left: 0,
    right: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});
