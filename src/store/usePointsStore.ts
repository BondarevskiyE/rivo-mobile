import {create} from 'zustand';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {persist, createJSONStorage} from 'zustand/middleware';

interface PointsState {
  points: number;
  setPoints: (points: number) => void;
}

export const usePointsStore = create<PointsState>()(
  persist(
    set => ({
      points: 0,
      setPoints: (points: number) => set({points}),
    }),
    {
      name: 'points-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
