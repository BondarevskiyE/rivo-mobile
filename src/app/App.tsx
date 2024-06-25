import React, {useEffect} from 'react';
import {SafeAreaView, StatusBar} from 'react-native';
import Routes from '@/routes';
import {Colors} from '@/shared/ui';
import {useAppState} from '@/shared/hooks/useAppState';
import {registerForegroundService} from '@/shared/lib/notifee';

export const App = () => {
  useAppState();

  useEffect(() => {
    registerForegroundService();
  }, []);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: Colors.ui_background}}>
      <StatusBar backgroundColor={Colors.ui_background} />
      <Routes />
    </SafeAreaView>
  );
};
