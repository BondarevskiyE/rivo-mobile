import React from 'react';
import {StyleSheet} from 'react-native';

import {SendTransactionForm} from '@/components/SendTransactionForm';
import {SEND_TRANSACTION_FORM_TYPE} from '@/components/SendTransactionForm/types';
import {chain, chainsMap} from '@/shared/constants/chain';
import {Colors} from '@/shared/ui';
import {initialWindowMetrics} from 'react-native-safe-area-context';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import {useZeroDevStore} from '@/store/useZeroDevStore';

interface Props {
  onClose: () => void;
}

export const SendScreen: React.FC<Props> = ({onClose}) => {
  const sendUSDCToAddress = useZeroDevStore(state => state.sendUSDCToAddress);

  const onSendTransaction = async (
    amount: string,
    toAddress?: `0x${string}`,
  ) => {
    const receipt = await sendUSDCToAddress(amount, toAddress as `0x${string}`);
    return receipt;
  };

  return (
    <Animated.View style={styles.container} entering={FadeIn} exiting={FadeOut}>
      <SendTransactionForm
        formType={SEND_TRANSACTION_FORM_TYPE.SEND}
        chain={chainsMap[chain.id]}
        onSendTransaction={onSendTransaction}
        onCloseForm={onClose}
        onCloseScreen={onClose}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

    paddingTop: initialWindowMetrics?.insets.top,
    paddingBottom: initialWindowMetrics?.insets.bottom,
    backgroundColor: Colors.ui_black,

    zIndex: 3,
  },
});
