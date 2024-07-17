import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import PolyfillCrypto from 'react-native-webview-crypto';

import Routes from '@/navigation';
import {Colors} from '@/shared/ui';
import {useAppState} from '@/shared/hooks';
import {
  checkNotificationPermissions,
  registerForegroundService,
} from '@/services/notifee';
import {Providers} from '@/Providers';
import Modal from '@/modal-manager';
import {useAppStore} from '@/store/useAppStore';
import {useLoginStore} from '@/store/useLoginStore';
import {useOnboardingStore} from '@/store/useOnboardingStore';
import {useZeroDevStore} from '@/store/useZeroDevStore';

export const App = () => {
  const setIsAppLoading = useAppStore(state => state.setIsAppLoading);

  const setIsPassCodeEntered = useLoginStore(
    state => state.setIsPassCodeEntered,
  );

  const clearHighlight = useOnboardingStore(state => state.clearHighlight);
  const reconnectZeroDev = useZeroDevStore(state => state.reconnectZeroDev);

  useAppState({
    onChange: () => {},
    onForeground: () => {},
    onBackground: () => {
      setIsPassCodeEntered(false);
      Modal.hide();
      clearHighlight();
    },
  });

  const initializeApp = async () => {
    registerForegroundService();
    checkNotificationPermissions();
    await reconnectZeroDev();

    setIsAppLoading(false);
  };

  useEffect(() => {
    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Providers>
      <PolyfillCrypto />
      <StatusBar backgroundColor={Colors.ui_background} />
      <Routes />
      <Modal />
    </Providers>
  );
};
