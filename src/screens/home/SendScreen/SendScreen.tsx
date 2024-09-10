import React from 'react';
import {StyleSheet} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import {SendTransactionForm} from '@/components/SendTransactionForm';
import {SEND_TRANSACTION_FORM_TYPE} from '@/components/SendTransactionForm/types';
import {chain, chainsMap} from '@/shared/constants/chain';
import {Colors} from '@/shared/ui';
import {useZeroDevStore} from '@/store/useZeroDevStore';
import {HomeStackProps, HOME_SCREENS} from '@/navigation/types/homeStack';
import {useBalanceStore} from '@/store/useBalanceStore';

type Props = StackScreenProps<HomeStackProps, HOME_SCREENS.SEND_SCREEN>;

export const SendScreen: React.FC<Props> = ({navigation}) => {
  const cashAccountBalance = useBalanceStore(state => state.cashAccountBalance);

  const sendUSDCToAddress = useZeroDevStore(state => state.sendUSDCToAddress);

  const onClose = () => {
    navigation.goBack();
  };

  const onSendTransaction = async (
    amount: string,
    toAddress?: `0x${string}`,
  ) => {
    const receipt = await sendUSDCToAddress(amount, toAddress as `0x${string}`);

    return receipt;
  };

  return (
    <SafeAreaView style={styles.container}>
      <SendTransactionForm
        formType={SEND_TRANSACTION_FORM_TYPE.SEND}
        balance={cashAccountBalance}
        chain={chainsMap[chain.id]}
        onSendTransaction={onSendTransaction}
        onCloseForm={onClose}
        onCloseScreen={onClose}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: Colors.ui_black,

    zIndex: 3,
  },
});
