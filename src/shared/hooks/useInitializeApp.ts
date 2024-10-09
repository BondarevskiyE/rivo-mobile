import {useEffect, useMemo} from 'react';
import messaging from '@react-native-firebase/messaging';

import Modal from '@/modal-manager';
import {
  checkInitialNotification,
  displayNotification,
  registerForegroundService,
  // createBackgroundEventNotificationsHandler,
} from '@/services/notifee';
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
import {useTransactionsHistoryStore} from '@/store/useTransactionsHistoryStore';

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

  const {fetchNotifications, addNotification} = useNotificationsStore(
    state => ({
      fetchNotifications: state.fetchNotifications,
      addNotification: state.addNotification,
    }),
  );

  const fetchTxHistory = useTransactionsHistoryStore(
    state => state.fetchTxHistory,
  );

  const fetchVaults = useVaultsStore(state => state.fetchVaults);

  const setIsPassCodeEntered = useLoginStore(
    state => state.setIsPassCodeEntered,
  );

  const clearHighlight = useOnboardingStore(state => state.clearHighlight);

  const reconnectZeroDev = useZeroDevStore(state => state.reconnectZeroDev);

  const createBlockScreenWithPasscodeMethod = () => {
    let timeoutId: NodeJS.Timeout;

    return (isNeedToBlock: boolean) => {
      if (isNeedToBlock) {
        timeoutId && clearTimeout(timeoutId);

        timeoutId = setTimeout(() => {
          setIsPassCodeEntered(false);
        }, FIVE_MINUTES_IN_MILISECONDS);
      } else {
        timeoutId && clearTimeout(timeoutId);
      }
    };
  };

  const blockScreenWithPasscode = useMemo(
    () => createBlockScreenWithPasscodeMethod(),
    [],
  );

  const {appState} = useAppState({
    onChange: () => {},
    onForeground: () => {
      blockScreenWithPasscode(false);
    },
    onBackground: () => {
      blockScreenWithPasscode(true);
      Modal.hide();
      clearHighlight();
    },
  });

  const initializeApp = async () => {
    registerForegroundService();

    // Get the token
    const token = await messaging().getToken();

    // console.log(token);

    await registerNotificationToken(walletAddress, token);

    await reconnectZeroDev();
  };

  const handleMessageReceived = async (message: RemoteMessage) => {
    displayNotification({
      title: message?.notification?.title,
      body: message?.notification?.body,
    });

    addNotification(message);
  };

  // fetch only if user is logged in
  useEffect(() => {
    if (isLoggedIn) {
      initializeApp();

      fetchTxHistory(walletAddress);

      const unsubscribeOnMessage = messaging().onMessage(handleMessageReceived);

      messaging().setBackgroundMessageHandler(handleMessageReceived);

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

  // refetch everytime user reopen the app from collapsed state
  useEffect(() => {
    // we don't need to load data when user collapsed the app
    if (isLoggedIn && appState !== 'background') {
      // check if the app was opened via notification
      checkInitialNotification();

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
