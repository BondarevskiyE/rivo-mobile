import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import PolyfillCrypto from 'react-native-webview-crypto';

import Routes from '@/navigation';
import {Colors} from '@/shared/ui';
import {useAppState} from '@/shared/hooks';
import {registerForegroundService} from '@/shared/lib/notifee';
import {Providers} from '@/Providers';
import Modal from '@/modal-manager';

export const App = () => {
  useAppState();

  useEffect(() => {
    registerForegroundService();
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
