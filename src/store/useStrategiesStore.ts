import {create} from 'zustand';

import {Strategy} from '@/shared/types';
import {strategiesData} from '@/shared/config/strategiesData';

interface StrategiesState {
  strategies: Strategy[];
}

export const useStrategiesStore = create<StrategiesState>()(_ => ({
  strategies: strategiesData,
}));
