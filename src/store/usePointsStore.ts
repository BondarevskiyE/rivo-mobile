import {create} from 'zustand';

interface PointsState {
  points: number;
  setPoints: (points: number) => void;
}

export const usePointsStore = create<PointsState>()(set => ({
  points: 0,
  setPoints: (points: number) => set({points}),
}));
