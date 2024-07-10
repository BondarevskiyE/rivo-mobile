import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import PolyfillCrypto from 'react-native-webview-crypto';

import Routes from '@/navigation';
import {Colors} from '@/shared/ui';
import {useAppState} from '@/shared/hooks';
import {registerForegroundService} from '@/shared/lib/notifee';
import {Providers} from '@/Providers';
import Modal from '@/modal-manager';
import {initWeb3Auth} from '@/shared/lib/web3auth';

export const App = () => {
  useAppState();

  useEffect(() => {
    registerForegroundService();

    initWeb3Auth();
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
