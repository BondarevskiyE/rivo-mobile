import React, {useEffect} from 'react';
import {StatusBar, LogBox} from 'react-native';
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
import {useUserStore} from '@/store/useUserStore';
import {userSigninBackend} from '@/shared/api';
import {useStrategiesStore} from '@/store/useStrategiesStore';
import {useBalanceStore} from '@/store/useBalanceStore';
// FIX @react-native-clipboard/clipboard library throw this error
LogBox.ignoreLogs(['new NativeEventEmitter']);

export const App = () => {
  const setIsAppLoading = useAppStore(state => state.setIsAppLoading);
  const isLoggedIn = useUserStore(state => state.isLoggedIn);

  const walletAddress = useUserStore(state => state.walletAddress);
  const userInfo = useUserStore(state => state.userInfo);
  const getBalance = useBalanceStore(state => state.getBalance);
  const getStrategies = useStrategiesStore(state => state.getStrategies);

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
  };

  const loadData = async () => {
    if (walletAddress && userInfo?.email) {
      await userSigninBackend(walletAddress, userInfo?.email);
    }

    if (isLoggedIn) {
      await getStrategies();
      await getBalance();
    }

    setIsAppLoading(false);
  };

  useEffect(() => {
    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadData();

      const interval = setInterval(async () => {
        getBalance();
      }, 20000);

      return () => {
        clearInterval(interval);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  return (
    <Providers>
      <PolyfillCrypto />
      <StatusBar backgroundColor={Colors.ui_background} />
      <Routes />
      <Modal />
    </Providers>
  );
};
