import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {Strategy, Vault} from '@/shared/types';
import {
  getActiveVaults,
  getHolders,
  getStrategyApy,
  getVaultApy,
  getVaultPrice,
  getVaultTvl,
} from '@/shared/api';
import {useBalanceStore} from './useBalanceStore';

type IndexUpdatesMap = Record<string, number>;

interface VaultsState {
  vaults: Vault[];
  fetchVaults: () => void;
  vaultUpdatesLengthMap: IndexUpdatesMap;
  setVaultUpdatesLength: (address: string, length: number) => void;
  reset: () => void;
}

export const useVaultsStore = create<VaultsState>()(
  persist(
    (set, get) => ({
      vaults: [],
      vaultUpdatesLengthMap: {},
      fetchVaults: async () => {
        const fetchTotalEarnedByVaults =
          useBalanceStore.getState().fetchTotalEarnedByVaults;

        const vaults = (await getActiveVaults()) || [];
        let vaultsWithInfo = [];

        const vaultUpdatesLengthMap = get().vaultUpdatesLengthMap;

        for (let i = 0; i < vaults.length; i++) {
          const current = vaults[i];

          if (!vaultUpdatesLengthMap?.[current.address]) {
            set({
              vaultUpdatesLengthMap: {
                ...vaultUpdatesLengthMap,
                [current.address]: 0,
              },
            });
          }

          const price = await getVaultPrice(current.address, current.chain);
          current.price = price?.value || 0;

          const apy = await getVaultApy(current.address, current.chain);
          current.apy = apy?.value || 0;

          const tvl = await getVaultTvl(current.address, current.chain);
          current.tvl = tvl?.value || 0;

          const holders = await getHolders(current.address, current.chain);
          current.holders = holders || 0;

          let formattedStrategies: Strategy[] = [];

          await Promise.all(
            current.strategies.map(async strategy => {
              const strategyApy = await getStrategyApy(
                strategy.address,
                strategy.chain,
              );
              let formattedStrategy = {
                ...strategy,
                apy: strategyApy?.value || 0,
              };
              formattedStrategies.push(formattedStrategy);
            }),
          );

          current.strategies = formattedStrategies;

          vaultsWithInfo.push(current);
        }

        set({vaults: vaultsWithInfo});

        fetchTotalEarnedByVaults();
      },
      setVaultUpdatesLength: (address: string, updatesLength: number) => {
        set({
          vaultUpdatesLengthMap: {
            ...get().vaultUpdatesLengthMap,
            [address]: updatesLength,
          },
        });
      },
      reset: () => {
        set({vaultUpdatesLengthMap: {}});
      },
    }),
    {
      name: 'vaults-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        // persist only indexUpdates
        vaultUpdatesLengthMap: state.vaultUpdatesLengthMap,
      }),
    },
  ),
);
