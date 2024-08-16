import {create} from 'zustand';

import {Alert} from 'react-native';

import {web3AuthReconnect} from '@/services/web3auth';
import {
  initZeroDevClient,
  sendInvestUserOperation,
  sendWithdrawUserOperation,
  swapTokenToUsdc,
  swapUsdcToToken,
} from '@/services/zerodev';
import {KernelClient} from './types';
import VaultTokenABI from '@/abis/VaultToken.json';
import VaultABI from '@/abis/Vault.json';
import ERC20ABI from '@/abis/ERC20.json';
import {useUserStore} from './useUserStore';
import {Vault} from '@/shared/types';
import {getContract} from '@/services/viem';

interface ZeroDevState {
  kernelClient: KernelClient | null;
  setKernelClient: (kernelAccount: KernelClient | null) => void;
  invest: (tokenContractAddress: `0x${string}`, amount: string) => void;
  withdraw: (vault: Vault, amount: string) => void;
  reconnectZeroDev: () => void;
}

export const useZeroDevStore = create<ZeroDevState>()((set, get) => ({
  kernelClient: null,
  setKernelClient: (kernelClient: KernelClient | null) => set({kernelClient}),

  invest: async (tokenContractAddress: `0x${string}`, amount: string) => {
    try {
      const userAddress = useUserStore.getState().walletAddress;

      const tokenContract = getContract({
        contractAddress: tokenContractAddress,
        abi: VaultTokenABI,
      });

      const investTokenAddress =
        (await tokenContract.read.token()) as `0x${string}`;

      await swapUsdcToToken({toTokenAddress: investTokenAddress, amount});

      const investTokenContract = getContract({
        contractAddress: investTokenAddress,
        abi: ERC20ABI,
      });

      const investTokenUserBalance = (await investTokenContract.read.balanceOf([
        userAddress,
      ])) as bigint;

      const investTxReceipt = await sendInvestUserOperation({
        investTokenAddress,
        vaultTokenContractAddress: tokenContractAddress,
        vaultTokenContractAbi: VaultTokenABI,
        investAmount: investTokenUserBalance,
      });

      Alert.alert('Success');
      return investTxReceipt;
    } catch (error) {
      console.log(error);
      Alert.alert(`something went wrong: ${error}`);
    }
  },
  withdraw: async (vault: Vault, amount: string) => {
    try {
      const kernelClient = get().kernelClient;
      const userAddress = useUserStore.getState().walletAddress;

      if (!kernelClient) {
        throw new Error('something went wrong');
      }

      const strategiesAddresses = vault.strategies.map(
        strategy => strategy.address,
      ) as `0x${string}`[];

      const withdrawTxReceipt = await sendWithdrawUserOperation({
        vaultAddress: vault.address as `0x${string}`,
        vaultAbi: VaultABI,
        withdrawAmount: amount,
        vaultTokenContractAddress: vault.token_address as `0x${string}`,
        vaultTokenContractAbi: VaultTokenABI,
        userAddress: userAddress as `0x${string}`,
        strategiesAddresses,
      });

      console.log('withdrawTxReceipt: ', withdrawTxReceipt);

      const vaultTokenContract = getContract({
        contractAddress: vault.token_address as `0x${string}`,
        abi: VaultTokenABI,
      });

      const withdrawTokenAddress =
        (await vaultTokenContract.read.token()) as `0x${string}`;

      const withdrawTokenContract = getContract({
        contractAddress: withdrawTokenAddress as `0x${string}`,
        abi: ERC20ABI,
      });

      const withdrawTokenUserBalance =
        (await withdrawTokenContract.read.balanceOf([userAddress])) as bigint;

      const swapToUSDCReceipt = swapTokenToUsdc({
        fromTokenAddress: withdrawTokenAddress,
        amount: withdrawTokenUserBalance,
      });

      console.log('swapToUSDCReceipt: ', swapToUSDCReceipt);
      Alert.alert('Success');
    } catch (error) {
      console.log(error);
      Alert.alert(`something went wrong: ${error}`);
    }
  },
  reconnectZeroDev: async () => {
    const smartAccountSigner = await web3AuthReconnect();

    if (smartAccountSigner) {
      const kernelClient = await initZeroDevClient(smartAccountSigner);

      set({kernelClient: kernelClient as KernelClient});
    }
  },
}));
