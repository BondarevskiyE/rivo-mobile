import React from 'react';

import {withChildren} from './shared/types';
import {useOnboardingStore} from './store/useOnboardingStore';

export const Providers = ({children}: withChildren) => {
  const highlightedElementId = useOnboardingStore(
    state => state.highlightedElementId,
  );

  console.log('highlightedElementId: ', highlightedElementId);

  return <>{children}</>;
};
