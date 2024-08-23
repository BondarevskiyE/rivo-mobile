import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {Vault} from '@/shared/types';
import {vaultsData} from '@/shared/config/vaultsData';
import {
  getHolders,
  // getActiveVaults,
  getVaultApy,
  getVaultPrice,
  getVaultTvl,
} from '@/shared/api';

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
        // const test = await getActiveVaults(); // TODO here is active vaults
        // console.log('test: ', test);
        const strategies = [...vaultsData]; // TODO change to backend request
        let strategiesWithInfo = [];

        const vaultUpdatesLengthMap = get().vaultUpdatesLengthMap;

        for (let i = 0; i < strategies.length; i++) {
          const current = strategies[i];

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

          strategiesWithInfo.push(current);
        }

        set({vaults: strategiesWithInfo});
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
        vaultUpdatesLengthMap: state.vaultUpdatesLengthMap,
      }),
    },
  ),
);
