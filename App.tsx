import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';

import Routes from '@/navigation';
import {Colors} from '@/shared/ui';
import {useAppState} from '@/shared/hooks';
import {registerForegroundService} from '@/shared/lib/notifee';
import {subscribeTwitterListener} from '@/shared/lib/twitter';
import {Providers} from '@/Providers';
import Modal from '@/modal-manager';

export const App = () => {
  useAppState();

  useEffect(() => {
    registerForegroundService();

    const twitterListener = subscribeTwitterListener();

    return () => {
      twitterListener.remove();
    };
  }, []);

  return (
    <Providers>
      <StatusBar backgroundColor={Colors.ui_background} />
      <Routes />
      <Modal />
    </Providers>
  );
};
