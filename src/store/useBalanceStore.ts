import {getUserBalance, getUserBalanceForce} from '@/shared/api';
import {create} from 'zustand';
import {useUserStore} from './useUserStore';

interface BalanceState {
  userBalance: number;
  totalEarned: number;
  cashAccountBalance: number;
  fetchBalance: (force?: boolean) => void;
  setUserBalancce: (balance: number) => void;
  setTotalEarned: (earned: number) => void;
  setCashAccountBalance: (balance: number) => void;
  resetBalances: () => void;
}

export const useBalanceStore = create<BalanceState>()(set => ({
  userBalance: 0.0,
  totalEarned: 0.0,
  cashAccountBalance: 0.0,
  fetchBalance: async (force?: boolean) => {
    const walletAddress = useUserStore.getState().walletAddress;

    if (walletAddress) {
      let balanceResponse;
      if (force) {
        balanceResponse = await getUserBalanceForce(walletAddress);
      } else {
        balanceResponse = await getUserBalance(walletAddress);
      }

      const balance = balanceResponse?.find(
        // address of arbitrum USDC
        token => token.address === '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      );

      balance &&
        set({userBalance: balance.amount, cashAccountBalance: balance.amount});
    }
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
