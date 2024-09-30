import {
  HighlightableElement,
  HighlightableElementProvider,
  HighlightOverlay,
} from 'react-native-highlight-overlay';
import {ClickOutsideProvider} from 'react-native-click-outside';
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
    <ClickOutsideProvider>
      <GestureHandlerRootView style={{flex: 1}}>
        <SafeAreaProvider>
          <HighlightableElementProvider>
            {children}
            <HighlightOverlay
              highlightedElementId={highlightedElementId}
              onDismiss={() => {}}
            />
            <HighlightableElement
              // It is an empty element to show faded overlay without highliting
              // react-native-highlight-overlay will show overlay but there is no coordinates to highlight
              id={HIGHLIGHT_ELEMENTS.NONE}
            />
          </HighlightableElementProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ClickOutsideProvider>
  );
};
