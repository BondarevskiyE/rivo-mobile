import {
  // getTotalBalance,
  getUserBalance,
  getUserBalanceForce,
  getUserIndexEarned,
} from '@/shared/api';
import {create} from 'zustand';
import {useUserStore} from './useUserStore';
import {useVaultsStore} from './useVaultsStore';

interface BalanceState {
  userBalance: number;
  totalEarned: number;
  cashAccountBalance: number;
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
  fetchBalance: async (force?: boolean) => {
    const walletAddress = useUserStore.getState().walletAddress;

    // const totalBalance = await getTotalBalance(walletAddress);

    // console.log('total: ', totalBalance);

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
  fetchTotalEarnedByVaults: async () => {
    const userAddress = useUserStore.getState().walletAddress;
    const vaults = useVaultsStore.getState().vaults;

    let totalEarned = 0;

    await Promise.all(
      vaults.map(async vault => {
        const earned = await getUserIndexEarned(userAddress, vault.address);
        if (!earned) {
          return;
        }
        totalEarned += earned.Usd;
      }),
    );

    set({totalEarned});
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
