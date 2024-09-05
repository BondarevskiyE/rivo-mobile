import {create} from 'zustand';

interface PointsState {
  points: number;
  setPoints: (points: number) => void;
  resetPoints: () => void;
}

export const usePointsStore = create<PointsState>()(set => ({
  points: 0,
  setPoints: (points: number) => set({points}),
  resetPoints: () => set({points: 0}),
}));
