import {create} from 'zustand';

export enum HIGHLIGHT_ELEMENTS {
  NONE = 'none',
  CASH_ACCOUNT = 'cash_account',
  STRATEGIES_LIST = 'strategies_list',
  POINTS = 'points',
}

interface OnboardingState {
  highlightedElementId: HIGHLIGHT_ELEMENTS | null;
  highlightElement: (id: HIGHLIGHT_ELEMENTS) => void;
  clearHighlight: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(set => ({
  highlightedElementId: null,
  highlightElement: (id: HIGHLIGHT_ELEMENTS) => set({highlightedElementId: id}),
  clearHighlight: () => set({highlightedElementId: null}),
}));
