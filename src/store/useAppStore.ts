import {create} from 'zustand';

interface AppState {
  isAppLoading: boolean;
  setIsAppLoading: (isLoading: boolean) => void;
}

export const useAppStore = create<AppState>()(set => ({
  isAppLoading: true,
  setIsAppLoading: (isLoading: boolean) => set({isAppLoading: isLoading}),
}));
