import {HIGHLIGHT_ELEMENTS} from '@/store/useOnboardingStore';
import {OnboardingStep} from '../types';
import {Images} from '@/shared/ui';

export const onboardingSteps: OnboardingStep[] = [
  {
    stepId: '1',
    text: 'Welcome to Rivo. Let’s start a quick tour for the main screen of the app.',
    scrollable: false,
    image: Images.onboardingSlide1,
    highlightElement: HIGHLIGHT_ELEMENTS.NONE,
  },
  {
    stepId: '2',
    text: 'Cash Account is your USDC Balance. This is the first thing you need to deposit to continue and used to enter to other positions.',
    scrollable: true,
    image: Images.onboardingSlide2,
    highlightElement: HIGHLIGHT_ELEMENTS.CASH_ACCOUNT,
  },
  {
    stepId: '3',
    text: 'These are the main decentralized strategies. To begin learning more about them, tap to view more information',
    scrollable: true,
    image: Images.onboardingSlide3,
    highlightElement: HIGHLIGHT_ELEMENTS.STRATEGIES_LIST,
  },
  {
    stepId: '4',
    text: 'These are the points. Earn them for completing certain tasks and participate in',
    scrollable: false,
    image: Images.onboardingSlide4,
    highlightElement: HIGHLIGHT_ELEMENTS.POINTS,
    position: 'top',
  },
];
