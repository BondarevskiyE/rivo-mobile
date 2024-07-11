import {create} from 'zustand';

interface BalanceState {
  userBalance: number;
  totalEarned: number;
  cashAccountBalance: number;
  setUserBalancce: (balance: number) => void;
  setTotalEarned: (earned: number) => void;
  setCashAccountBalance: (balance: number) => void;
}

export const useBalanceStore = create<BalanceState>()(set => ({
  userBalance: 0.0,
  totalEarned: 0.0,
  cashAccountBalance: 0.0,
  setUserBalancce: (balance: number) => set({userBalance: balance}),
  setTotalEarned: (earned: number) => set({totalEarned: earned}),
  setCashAccountBalance: (balance: number) =>
    set({cashAccountBalance: balance}),
}));
