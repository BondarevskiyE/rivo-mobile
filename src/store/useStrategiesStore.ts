import {create} from 'zustand';

import {Strategy} from '@/shared/types';
import {strategiesData} from '@/shared/config/strategiesData';
import {getVaultApy, getVaultPrice, getVaultTvl} from '@/shared/api';

interface StrategiesState {
  strategies: Strategy[];
  getStrategies: () => void;
}

export const useStrategiesStore = create<StrategiesState>()(set => ({
  strategies: [],
  getStrategies: async () => {
    const strategies = [...strategiesData]; // TODO change to backend request
    let strategiesWithInfo = [];

    for (let i = 0; i < strategies.length; i++) {
      const current = strategies[i];

      const prices = await getVaultPrice(current.address, current.chain);
      current.price = prices ? prices[prices?.length - 1].price : 0;

      const apy = await getVaultApy(current.address, current.chain);
      current.apy = apy ? apy[apy?.length - 1].apy : 0;

      const tvl = await getVaultTvl(current.address, current.chain);
      current.tvl = tvl ? tvl?.[tvl?.length - 1].tvl : 0;

      strategiesWithInfo.push(current);
    }

    set({strategies: strategiesWithInfo});
  },
}));
