import React from 'react';
import {
  HighlightableElement,
  HighlightableElementProvider,
  HighlightOverlay,
} from 'react-native-highlight-overlay';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import {withChildren} from './shared/types';
import {
  HIGHLIGHT_ELEMENTS,
  useOnboardingStore,
} from './store/useOnboardingStore';

export const Providers = ({children}: withChildren) => {
  const highlightedElementId = useOnboardingStore(
    state => state.highlightedElementId,
  );

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <HighlightableElementProvider>
          {children}
          <HighlightOverlay
            highlightedElementId={highlightedElementId}
            onDismiss={() => {}}
          />
          <HighlightableElement
            // It is an empty element for showing faded overlay without highliting
            id={HIGHLIGHT_ELEMENTS.NONE}
          />
        </HighlightableElementProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};
