import {useEffect} from 'react';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';

import Modal from '@/modal-manager';
import {registerForegroundService} from '@/services/notifee';
import {useAppStore} from '@/store/useAppStore';
import {useBalanceStore} from '@/store/useBalanceStore';
import {useLoginStore} from '@/store/useLoginStore';
import {useNotificationsStore} from '@/store/useNotificationsStore';
import {useOnboardingStore} from '@/store/useOnboardingStore';
import {useUserStore} from '@/store/useUserStore';
import {useVaultsStore} from '@/store/useVaultsStore';
import {useZeroDevStore} from '@/store/useZeroDevStore';
import {userSigninBackend} from '../api';
import {
  THIRTY_SECONDS_IN_MILISECONDS,
  FIVE_MINUTES_IN_MILISECONDS,
} from '../constants/time';
import {useAppState} from './useAppState';
import {RemoteMessage} from '../types/notification';

function onMessageReceived(message: RemoteMessage) {
  notifee.displayNotification({
    title: message?.notification?.title,
    body: message?.notification?.body,
  });
}

export const useInitializeApp = () => {
  const setIsAppLoading = useAppStore(state => state.setIsAppLoading);

  const {walletAddress, isLoggedIn, userInfo} = useUserStore(state => ({
    walletAddress: state.walletAddress,
    isLoggedIn: state.isLoggedIn,
    userInfo: state.userInfo,
  }));

  const {fetchBalance, fetchTotalEarnedByVaults} = useBalanceStore(state => ({
    fetchBalance: state.fetchBalance,
    fetchTotalEarnedByVaults: state.fetchTotalEarnedByVaults,
  }));

  const fetchNotifications = useNotificationsStore(
    state => state.fetchNotifications,
  );

  const fetchVaults = useVaultsStore(state => state.fetchVaults);

  const setIsPassCodeEntered = useLoginStore(
    state => state.setIsPassCodeEntered,
  );

  const clearHighlight = useOnboardingStore(state => state.clearHighlight);

  const reconnectZeroDev = useZeroDevStore(state => state.reconnectZeroDev);

  const {appState} = useAppState({
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

    fetchNotifications();
    // Register the device with FCM
    // await messaging().registerDeviceForRemoteMessages();

    // Get the token
    const token = await messaging().getToken();

    // console.log('token: ', token);

    messaging().onMessage(onMessageReceived);
    // @ts-ignore
    messaging().setBackgroundMessageHandler(onMessageReceived);

    await reconnectZeroDev();
  };

  const loadData = async () => {
    if (walletAddress && userInfo?.email) {
      await userSigninBackend(walletAddress, userInfo?.email);
    }

    if (isLoggedIn) {
      await fetchVaults();
      await fetchBalance();
    }

    setIsAppLoading(false);
  };

  useEffect(() => {
    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isLoggedIn && appState === 'active') {
      loadData();

      const intervalBalance = setInterval(async () => {
        fetchBalance();
      }, THIRTY_SECONDS_IN_MILISECONDS);

      const intervalEarned = setInterval(async () => {
        fetchTotalEarnedByVaults();
      }, FIVE_MINUTES_IN_MILISECONDS);

      return () => {
        clearInterval(intervalBalance);
        clearInterval(intervalEarned);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, appState]);
};
