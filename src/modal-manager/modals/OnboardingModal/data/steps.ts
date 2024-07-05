import {HIGHLIGHT_ELEMENTS} from '@/store/useOnboardingStore';
import {OnboardingStep} from '../types';

export const onboardingSteps: OnboardingStep[] = [
  {
    stepId: '1',
    text: 'Welcome to Rivo. Let’s start a quick tour for the main screen of the app.',
    scrollable: false,
    highlightElement: HIGHLIGHT_ELEMENTS.NONE,
  },
  {
    stepId: '2',
    text: 'Cash Account is your USDC Balance. This is the first thing you need to deposit to continue and used to enter to other positions.',
    scrollable: true,
    highlightElement: HIGHLIGHT_ELEMENTS.CASH_ACCOUNT,
  },
  {
    stepId: '3',
    text: 'These are the main decentralized strategies. To begin learning more about them, tap to view more information',
    scrollable: true,
    highlightElement: HIGHLIGHT_ELEMENTS.STRATEGIES_LIST,
  },
  {
    stepId: '4',
    text: 'These are the points. Earn them for completing certain tasks and participate in',
    scrollable: false,
    highlightElement: HIGHLIGHT_ELEMENTS.POINTS,
    position: 'top',
  },
];
