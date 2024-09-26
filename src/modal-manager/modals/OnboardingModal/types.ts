import {HIGHLIGHT_ELEMENTS} from '@/store/useOnboardingStore';
import {ImageSourcePropType} from 'react-native';

export type OnboardingStep = {
  stepId: string;
  text: string;
  scrollable: boolean;
  image: ImageSourcePropType;
  highlightElement: HIGHLIGHT_ELEMENTS;
  position?: 'top' | 'bottom';
};
