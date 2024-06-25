import {useRef, useEffect, useState} from 'react';
import {AppState} from 'react-native';

import {useLoginStore} from '@/store/useLoginStore';

export const useAppState = () => {
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  const setIsPassCodeEntered = useLoginStore(
    state => state.setIsPassCodeEntered,
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/background/) && nextAppState === 'active') {
        setIsPassCodeEntered(false);
      }

      appState.current = nextAppState;
      setAppStateVisible(appState.current);
    });

    return () => {
      subscription.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return appStateVisible;
};
