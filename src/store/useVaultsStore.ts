import {create} from 'zustand';

import {Vault} from '@/shared/types';
import {vaultsData} from '@/shared/config/vaultsData';
import {
  getHolders,
  // getActiveVaults,
  getVaultApy,
  getVaultPrice,
  getVaultTvl,
} from '@/shared/api';

interface VaultsState {
  vaults: Vault[];
  fetchVaults: () => void;
}

export const useVaultsStore = create<VaultsState>()(set => ({
  vaults: [],
  fetchVaults: async () => {
    // const test = await getActiveVaults(); // TODO here is active vaults
    // console.log('test: ', test);
    const strategies = [...vaultsData]; // TODO change to backend request
    let strategiesWithInfo = [];

    for (let i = 0; i < strategies.length; i++) {
      const current = strategies[i];

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
}));
