import {create} from 'zustand';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {persist, createJSONStorage} from 'zustand/middleware';
import {TxHistoryTransaction} from '@/shared/types/transactionHistory';

const txHistoryMock: TxHistoryTransaction[] = [
  {
    title: 'Cash Account deposit ',
    icon: 'dollar',
    time: 1726481239214,
    amount: 13233120.09,
    hash: '0x7c6bfd1cd8cc01137ede8971c570869b80278d6c1c5d1046906b63a7fb691107',
  },
  {
    title: 'ETH Metaindex invest',
    icon: 'eth',
    time: 1626481239214,
    amount: 1390.09,
    hash: '0x7c6bfd1cd8cc01137ede8971c570869b80278d6c1c5d1046906b63a7fb691107',
  },
  {
    title: 'Cash Account deposit',
    icon: 'dollar',
    time: 1526481239214,
    amount: -1390.09,
    hash: '0x7c6bfd1cd8cc01137ede8971c570869b80278d6c1c5d1046906b63a7fb691107',
  },
];

interface TransactionsHistoryState {
  txHistory: TxHistoryTransaction[];
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
