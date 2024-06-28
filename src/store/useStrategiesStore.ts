import {create} from 'zustand';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {persist, createJSONStorage} from 'zustand/middleware';
import {Strategy} from '@/shared/types';
import {strategiesData} from '@/shared/config/strategiesData';

interface StrategiesState {
  strategies: Strategy[];
}

export const useStrategiesStore = create<StrategiesState>()(
  persist(
    _ => ({
      strategies: strategiesData,
    }),
    {
      name: 'strategies-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
