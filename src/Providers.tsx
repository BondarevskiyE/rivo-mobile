import React from 'react';
import {
  HighlightableElementProvider,
  HighlightOverlay,
} from 'react-native-highlight-overlay';

import {withChildren} from './shared/types';
import {useOnboardingStore} from './store/useOnboardingStore';

export const Providers = ({children}: withChildren) => {
  const highlightedElementId = useOnboardingStore(
    state => state.highlightedElementId,
  );

  return (
    <HighlightableElementProvider>
      {children}
      <HighlightOverlay
        highlightedElementId={highlightedElementId}
        onDismiss={() => {}}
      />
    </HighlightableElementProvider>
  );
};
