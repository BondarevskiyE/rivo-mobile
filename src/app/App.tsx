import React, {useEffect} from 'react';
import {SafeAreaView, StatusBar} from 'react-native';
import Routes from '@/routes';
import {Colors} from '@/shared/ui';
import {useAppState} from '@/shared/hooks';
import {registerForegroundService} from '@/shared/lib/notifee';
import {subscribeTwitterListener} from '@/shared/lib/twitter';

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
    <SafeAreaView style={{flex: 1, backgroundColor: Colors.ui_background}}>
      <StatusBar backgroundColor={Colors.ui_background} />
      <Routes />
    </SafeAreaView>
  );
};
