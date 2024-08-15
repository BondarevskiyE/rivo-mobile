// FIX remove this mock

import React, {useEffect, useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import {Client, createPublicClient, getContract, http} from 'viem';

import ERC20ABI from '@/abis/ERC20.json';
import {Button} from '@/components';
import {PENDLE_ETH_VAULT_ADDRESS} from '@/shared/constants';
import {useVaultsStore} from '@/store/useVaultsStore';
import {useZeroDevStore} from '@/store/useZeroDevStore';
import {chain} from '@/services/zerodev';
import {useUserStore} from '@/store/useUserStore';
import {getTokenValueStr} from '@/shared/lib/bigInt';

export function PlusScreen() {
  const pendleETHVault = useVaultsStore(state =>
    state.vaults.find(vault => vault.address === PENDLE_ETH_VAULT_ADDRESS),
  );
  const kernelClient = useZeroDevStore(state => state.kernelClient);
  const userAddress = useUserStore(state => state.walletAddress);

  const withdraw = useZeroDevStore(state => state.withdraw);

  const [pendleBalance, setPendleBalance] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const onWithdrawPendleETH = async () => {
    if (!pendleETHVault) {
      Alert.alert('no pendleETH vault');
      return;
    }
    setIsLoading(true);
    await withdraw(pendleETHVault, pendleBalance);
    setIsLoading(false);
    getPendleBalance();
  };

  const getPendleBalance = async () => {
    const publicClient = createPublicClient({
      chain: chain,
      transport: http(),
    });

    const vaultContract = getContract({
      address: '0xa31ec4c877c65bea5c5d4c307473624a0b377090' as `0x${string}`,
      abi: ERC20ABI,
      client: {
        public: publicClient,
        // viem doesn't like to get wallet field as zerodev kernelClient but it can to (https://docs.zerodev.app/sdk/core-api/send-transactions)
        wallet: kernelClient as unknown as Client,
      },
    });

    const balance = (await vaultContract.read.balanceOf([
      userAddress,
    ])) as bigint;

    setPendleBalance(getTokenValueStr(balance, 18));
  };

  useEffect(() => {
    getPendleBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kernelClient]);
  return (
    <View style={styles.container}>
      <Text>{`PendleETH balance: ${pendleBalance}`}</Text>

      {isLoading && <Text>Loading...</Text>}

      <Button
        text="Withdraw all funds (pendleETHVault)"
        onPress={onWithdrawPendleETH}
        disabled={!pendleBalance}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
