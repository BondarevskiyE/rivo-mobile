import {create} from 'zustand';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {persist, createJSONStorage} from 'zustand/middleware';
import {TxHistoryItem} from '@/shared/types/transactionHistory';

const txHistoryMock: TxHistoryItem[] = [
  {
    title: 'Cash Account deposit',
    icon: 'dollar',
    time: 1726481239214,
    amount: 1390.09,
  },
  {
    title: 'ETH Metaindex invest',
    icon: 'eth',
    time: 1626481239214,
    amount: 1390.09,
  },
  {
    title: 'Cash Account deposit',
    icon: 'dollar',
    time: 1526481239214,
    amount: -1390.09,
  },
];

interface TransactionsHistoryState {
  txHistory: TxHistoryItem[];
  isLoading: boolean;
  fetchTxHistory: (address: string) => void;
  resetHistory: () => void;
}

export const useTransactionsHistoryStore = create<TransactionsHistoryState>()(
  persist(
    set => ({
      txHistory: [],
      isLoading: false,
      fetchTxHistory: async (address: string) => {
        set({isLoading: true});
        set({txHistory: txHistoryMock});
        set({isLoading: false});
      },
      resetHistory: () => {
        set({txHistory: []});
      },
    }),
    {
      name: 'transactions-history-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        txHistory: state.txHistory,
      }),
    },
  ),
);
