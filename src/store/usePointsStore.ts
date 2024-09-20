import {create} from 'zustand';

interface PointsState {
  points: number;
  activeParticipants: number;
  setPoints: (points: number) => void;
  resetPoints: () => void;
}

export const usePointsStore = create<PointsState>()(set => ({
  points: 12234,
  activeParticipants: 12234,
  setPoints: (points: number) => set({points}),
  resetPoints: () => set({points: 0}),
}));
