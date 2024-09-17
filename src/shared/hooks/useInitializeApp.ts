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
import {registerNotificationToken} from '../api';
import {
  THIRTY_SECONDS_IN_MILISECONDS,
  FIVE_MINUTES_IN_MILISECONDS,
} from '../constants/time';
import {useAppState} from './useAppState';
import {RemoteMessage} from '../types/notification';

async function onMessageReceived(message: RemoteMessage) {
  console.log(message);
  notifee.displayNotification({
    title: message?.notification?.title,
    body: message?.notification?.body,
  });
}

export const useInitializeApp = () => {
  const setIsAppLoading = useAppStore(state => state.setIsAppLoading);

  const {walletAddress} = useUserStore(state => ({
    walletAddress: state.walletAddress,
  }));

  const isLoggedIn = useLoginStore(state => state.isLoggedIn);

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

    // Get the token
    const token = await messaging().getToken();
    const apn = await messaging().app.options;

    console.log(token);
    console.log(apn);

    await registerNotificationToken(walletAddress, token);

    await reconnectZeroDev();
  };

  // fetch only if user is logged in
  useEffect(() => {
    if (isLoggedIn) {
      initializeApp();

      messaging().registerDeviceForRemoteMessages();

      const unsubscribeOnMessage = messaging().onMessage(onMessageReceived);

      messaging().setBackgroundMessageHandler(onMessageReceived);

      const unsibscribeOnTokenRefresh = messaging().onTokenRefresh(
        async (token: string) => {
          await registerNotificationToken(walletAddress, token);
        },
      );

      fetchNotifications();

      return () => {
        unsubscribeOnMessage();
        unsibscribeOnTokenRefresh();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const loadData = async () => {
    await fetchVaults();
    await fetchBalance();

    setIsAppLoading(false);
  };

  // refetch everyime user reopen the app after collapsing
  useEffect(() => {
    // we don't need to load data when user collapsed the app
    if (isLoggedIn && appState !== 'background') {
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
