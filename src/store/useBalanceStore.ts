import {getUserBalance} from '@/shared/api';
import {create} from 'zustand';
import {useUserStore} from './useUserStore';

interface BalanceState {
  userBalance: number;
  totalEarned: number;
  cashAccountBalance: number;
  getBalance: () => void;
  setUserBalancce: (balance: number) => void;
  setTotalEarned: (earned: number) => void;
  setCashAccountBalance: (balance: number) => void;
}

export const useBalanceStore = create<BalanceState>()(set => ({
  userBalance: 0.0,
  totalEarned: 0.0,
  cashAccountBalance: 0.0,
  getBalance: async () => {
    const walletAddress = useUserStore.getState().walletAddress;

    if (walletAddress) {
      const balanceResponse = await getUserBalance(walletAddress); // rFIX '0x07079492698dC7cdAd0F3b736B2Df669544fC8d2' - test wallet with balance

      const balance = balanceResponse?.find(
        // address of arbitrum USDC
        token => token.address === '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      );

      balance && set({userBalance: balance.amount});
    }
  },
  setUserBalancce: (balance: number) => set({userBalance: balance}),
  setTotalEarned: (earned: number) => set({totalEarned: earned}),
  setCashAccountBalance: (balance: number) =>
    set({cashAccountBalance: balance}),
}));
