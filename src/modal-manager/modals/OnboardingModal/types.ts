import {HIGHLIGHT_ELEMENTS} from '@/store/useOnboardingStore';

export type OnboardingStep = {
  stepId: string;
  text: string;
  scrollable: boolean;
  highlightElement: HIGHLIGHT_ELEMENTS;
  additionalScrollOffset?: number;
  position?: 'top' | 'bottom';
};
