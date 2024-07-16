import {useState, useEffect} from 'react';
import {AppState, AppStateStatus, Platform} from 'react-native';

interface Params {
  onChange: (state: AppStateStatus) => void;
  onForeground: () => void;
  onBackground: () => void;
}

export function useAppState(settings: Params) {
  const {onChange, onForeground, onBackground} = settings || {};
  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState,
  );

  useEffect(() => {
    function handleAppStateChange(nextAppState: AppStateStatus) {
      if (nextAppState === 'active' && appState !== 'active') {
        isValidFunction(onForeground) && onForeground();
      } else if (
        Platform.OS === 'android' &&
        appState === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        isValidFunction(onBackground) && onBackground();
      } else if (
        Platform.OS === 'ios' &&
        appState === 'inactive' &&
        nextAppState.match(/background/)
      ) {
        isValidFunction(onBackground) && onBackground();
      }
      setAppState(nextAppState);
      isValidFunction(onChange) && onChange(nextAppState);
    }
    const appStateSubscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => appStateSubscription.remove();
  }, [onChange, onForeground, onBackground, appState]);

  // settings validation
  function isValidFunction(func: (params: any) => any) {
    return func && typeof func === 'function';
  }
  return {appState};
}
