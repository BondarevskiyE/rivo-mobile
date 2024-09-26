import {create} from 'zustand';

import {Alert} from 'react-native';

import {web3AuthReconnect} from '@/services/web3auth';
import {
  initZeroDevClient,
  sendInvestUserOperation,
  sendUSDCToAddress,
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
import {useBalanceStore} from './useBalanceStore';
import {GetUserOperationReceiptReturnType} from 'permissionless';
import {useTransactionsHistoryStore} from './useTransactionsHistoryStore';

interface ZeroDevState {
  kernelClient: KernelClient | null;
  setKernelClient: (kernelAccount: KernelClient | null) => void;
  invest: (
    vault: Vault,
    amount: string,
  ) => Promise<GetUserOperationReceiptReturnType | null>;
  withdraw: (
    vault: Vault,
    amount: string,
  ) => Promise<GetUserOperationReceiptReturnType | null>;
  sendUSDCToAddress: (
    amount: string,
    toAddress: `0x${string}`,
  ) => Promise<GetUserOperationReceiptReturnType | null>;
  reconnectZeroDev: () => void;
}

export const useZeroDevStore = create<ZeroDevState>()((set, get) => ({
  kernelClient: null,
  setKernelClient: (kernelClient: KernelClient | null) => set({kernelClient}),

  invest: async (
    vault: Vault,
    amount: string,
  ): Promise<GetUserOperationReceiptReturnType | null> => {
    const tokenContractAddress = vault.token_address;

    const userAddress = useUserStore.getState().walletAddress;

    const fetchBalance = useBalanceStore.getState().fetchBalance;

    const fetchTxHistory =
      useTransactionsHistoryStore.getState().fetchTxHistory;

    try {
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

      await fetchBalance();
      await fetchTxHistory(userAddress);
      return investTxReceipt;
    } catch (error) {
      console.log(error);
      Alert.alert(`something went wrong: ${error}`);
      return null;
    }
  },
  withdraw: async (vault: Vault, amount: string) => {
    const fetchBalance = useBalanceStore.getState().fetchBalance;

    const userAddress = useUserStore.getState().walletAddress;

    const fetchTxHistory =
      useTransactionsHistoryStore.getState().fetchTxHistory;

    try {
      const kernelClient = get().kernelClient;

      if (!kernelClient) {
        throw new Error('something went wrong');
      }

      const strategiesAddresses = vault.strategies.map(
        strategy => strategy.address,
      ) as `0x${string}`[];

      await sendWithdrawUserOperation({
        vaultAddress: vault.address as `0x${string}`,
        vaultAbi: VaultABI,
        withdrawAmount: amount,
        vaultTokenContractAddress: vault.token_address as `0x${string}`,
        vaultTokenContractAbi: VaultTokenABI,
        userAddress: userAddress as `0x${string}`,
        strategiesAddresses,
      });

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

      await fetchBalance();

      await fetchTxHistory(userAddress);

      return swapToUSDCReceipt;
    } catch (error) {
      console.log(error);
      Alert.alert(`something went wrong: ${error}`);
      return null;
    }
  },
  sendUSDCToAddress: async (amount: string, toAddress: `0x${string}`) => {
    try {
      const kernelClient = get().kernelClient;

      if (!kernelClient) {
        throw new Error('something went wrong');
      }

      const receipt = await sendUSDCToAddress(amount, toAddress);

      return receipt;
    } catch (error) {
      console.log(error);
      Alert.alert(`something went wrong: ${error}`);
      return null;
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
