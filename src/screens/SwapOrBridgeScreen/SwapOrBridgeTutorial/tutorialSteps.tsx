import React from 'react';
import {ImageSourcePropType, Text} from 'react-native';

import {Colors, Images} from '@/shared/ui';

export const tutorialSteps: TutorialStep[] = [
  {
    imageUrl: Images.swapOrBridgeTutorial1,
    text: 'To change your funds for USDC on Arbitrum we use Symbiosis. First, connect your wallet in the window below',
  },
  {
    imageUrl: Images.swapOrBridgeTutorial2,
    text: 'Choose the assets and enter amount. Swap your funds to USDC on Arbitrum USDC',
  },
  {
    imageUrl: Images.swapOrBridgeTutorial3,
    withCopyHandler: true,
    text: (
      <Text>
        Switch this option. Now{' '}
        <Text
          style={{
            textDecorationLine: 'underline',
            color: Colors.ui_green_46,
          }}>
          copy
        </Text>{' '}
        and paste your Rivo wallet address
      </Text>
    ),
  },
  {
    imageUrl: Images.swapOrBridgeTutorial4,
    text: 'Double check the address and USDC on Arbitrum. Press Swap and confirm transaction in your wallet',
  },
];

export type TutorialStep = {
  imageUrl: ImageSourcePropType;
  text: React.JSX.Element | string;
  withCopyHandler?: boolean;
};
