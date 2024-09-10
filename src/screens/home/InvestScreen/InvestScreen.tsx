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
import {useVaultsStore} from '@/store/useVaultsStore';
import {Vault} from '@/shared/types';

type Props = StackScreenProps<HomeStackProps, HOME_SCREENS.INVEST_SCREEN>;

export const InvestScreen: React.FC<Props> = ({route, navigation}) => {
  const {vaultAddress} = route.params;

  const vaultByAddress = useVaultsStore(
    state =>
      state.vaults.find(item => item.address.toLowerCase() === vaultAddress),

    // there couldn't be undefined
  ) as Vault;

  const cashAccountBalance = useBalanceStore(state => state.cashAccountBalance);

  const invest = useZeroDevStore(state => state.invest);

  const onClose = () => {
    navigation.goBack();
  };

  const onSendTransaction = async (amount: string) => {
    const receipt = await invest(vaultByAddress, amount);

    return receipt;
  };

  return (
    <SafeAreaView style={styles.container}>
      <SendTransactionForm
        formType={SEND_TRANSACTION_FORM_TYPE.INVEST}
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
