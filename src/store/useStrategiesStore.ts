import {create} from 'zustand';

import {Strategy} from '@/shared/types';
import {strategiesData} from '@/shared/config/strategiesData';
import {
  // getActiveVaults,
  getVaultApy,
  getVaultPrice,
  getVaultTvl,
} from '@/shared/api';

interface StrategiesState {
  strategies: Strategy[];
  getStrategies: () => void;
}

export const useStrategiesStore = create<StrategiesState>()(set => ({
  strategies: [],
  getStrategies: async () => {
    // const test = await getActiveVaults(); // TODO here is active vaults
    // console.log('test: ', test);
    const strategies = [...strategiesData]; // TODO change to backend request
    let strategiesWithInfo = [];

    for (let i = 0; i < strategies.length; i++) {
      const current = strategies[i];

      const price = await getVaultPrice(current.address, current.chain);
      current.price = price?.value || 0;

      const apy = await getVaultApy(current.address, current.chain);
      console.log('apy: ', apy);
      current.apy = apy?.value || 0;

      const tvl = await getVaultTvl(current.address, current.chain);
      current.tvl = tvl?.value || 0;

      strategiesWithInfo.push(current);
    }

    set({strategies: strategiesWithInfo});
  },
}));
