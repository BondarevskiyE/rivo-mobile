import React, {useState} from 'react';
import {Alert, StyleSheet, Text, TextInput, View} from 'react-native';

import {WhiteInfoModal} from './WhiteInfoModal';
import {Button} from '@/components';
import {useZeroDevStore} from '@/store/useZeroDevStore';
import {Colors, Fonts} from '@/shared/ui';
import {useBalanceStore} from '@/store/useBalanceStore';

interface Props {
  vaultTokenAddress: `0x${string}`;
}

export const InvestModal: React.FC<Props> = ({vaultTokenAddress}) => {
  const invest = useZeroDevStore(state => state.invest);
  const balanceUSDC = useBalanceStore(state => state.userBalance);

  const [investAmount, setInvestAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isEnoughBalance = +balanceUSDC >= +investAmount;

  const onPressInvest = async () => {
    setIsLoading(true);
    try {
      await invest(vaultTokenAddress, investAmount);
    } catch (error) {
      console.log('error: ', error);
      Alert.alert('Something went wrong');
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WhiteInfoModal>
      <View style={styles.container}>
        <TextInput
          onChangeText={setInvestAmount}
          value={investAmount}
          style={[
            styles.input,
            {borderColor: isEnoughBalance ? 'transparent' : 'red'},
          ]}
        />
        {isLoading && <Text style={styles.loading}>Loading...</Text>}
        {!isEnoughBalance && <Text>insufficient funds</Text>}
        <View style={styles.button}>
          <Button
            text="invest"
            onPress={onPressInvest}
            disabled={isLoading || !isEnoughBalance}
          />
        </View>
      </View>
    </WhiteInfoModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  address: {marginVertical: 5},
  button: {
    width: '100%',
  },
  input: {
    borderWidth: 1,
    width: '100%',
    backgroundColor: Colors.ui_beige_20,
  },
  loading: {
    fontFamily: Fonts.medium,
    fontSize: 18,
  },
});
