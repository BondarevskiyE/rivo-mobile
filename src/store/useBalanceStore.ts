import {create} from 'zustand';

import {getTotalBalance, getUserIndexEarned} from '@/shared/api';
import {useUserStore} from './useUserStore';
import {useVaultsStore} from './useVaultsStore';
import {USDC_ARBITRUM_ADDRESS} from '@/shared/constants';
import {IndexBalance, IndexEarned} from './types';

const defaultIndexEraned = {
  Percent: 0,
  Usd: 0,
  Want: 0,
};

interface BalanceState {
  userBalance: number;
  totalEarned: number;
  cashAccountBalance: number;
  indexesEarnedMap: Record<string, IndexEarned>;
  indexesBalanceMap: Record<string, IndexBalance>;
  fetchBalance: (force?: boolean) => void;
  fetchTotalEarnedByVaults: () => void;
  setUserBalancce: (balance: number) => void;
  setTotalEarned: (earned: number) => void;
  setCashAccountBalance: (balance: number) => void;
  resetBalances: () => void;
}

export const useBalanceStore = create<BalanceState>()(set => ({
  userBalance: 0.0,
  totalEarned: 0.0,
  cashAccountBalance: 0.0,
  indexesEarnedMap: {},
  indexesBalanceMap: {},
  fetchBalance: async () => {
    const walletAddress = useUserStore.getState().walletAddress;

    if (walletAddress) {
      const balanceResponse = await getTotalBalance(walletAddress);

      let cashAccountBalance = 0;
      let userBalance = 0;
      let indexesBalanceMap: Record<string, IndexBalance> = {};

      balanceResponse?.tokens?.forEach(token => {
        // cash account balance
        if (token.address.toLowerCase() === USDC_ARBITRUM_ADDRESS) {
          cashAccountBalance = token.amount;
        }
        userBalance += token.amount;

        indexesBalanceMap[token.address.toLowerCase()] = {
          usd: token.amount,
          token: 0,
        };
      });

      set({
        userBalance,
        cashAccountBalance,
        indexesBalanceMap,
      });
    }
  },
  fetchTotalEarnedByVaults: async () => {
    const userAddress = useUserStore.getState().walletAddress;
    const vaults = useVaultsStore.getState().vaults;

    let totalEarned = 0;
    const indexesEarnedMap: Record<string, IndexEarned> = {};

    await Promise.all(
      vaults.map(async vault => {
        const earned = await getUserIndexEarned(userAddress, vault.address);

        indexesEarnedMap[vault.address] = earned || defaultIndexEraned;

        totalEarned += earned?.Usd || 0;
      }),
    );

    set({totalEarned, indexesEarnedMap});
  },
  setUserBalancce: (balance: number) => set({userBalance: balance}),
  setTotalEarned: (earned: number) => set({totalEarned: earned}),
  setCashAccountBalance: (balance: number) =>
    set({cashAccountBalance: balance}),
  resetBalances: () => {
    set({
      userBalance: 0.0,
      totalEarned: 0.0,
      cashAccountBalance: 0.0,
    });
  },
}));
