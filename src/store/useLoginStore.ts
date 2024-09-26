import {create} from 'zustand';
import {LOGIN_PROVIDER_TYPE} from '@web3auth/react-native-sdk';
import {persist, createJSONStorage} from 'zustand/middleware';

import * as RootNavigation from '@/navigation/RootNavigation';
import {useUserStore} from './useUserStore';
import {resetKeychainCredentials} from '@/services/keychain';
import {web3AuthLogin, logoutWeb3Auth} from '@/services/web3auth';
import {initZeroDevClient} from '@/services/zerodev';
import {useZeroDevStore} from './useZeroDevStore';
import {KernelClient} from './types';
import {AUTH_SCREENS} from '@/navigation/types/authStack';
import {checkIsUserAlreadyRegistered, userSigninBackend} from '@/shared/api';
import {useBalanceStore} from './useBalanceStore';
import {usePointsStore} from './usePointsStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTransactionsHistoryStore} from './useTransactionsHistoryStore';

interface LoginState {
  isLoading: boolean;
  isLoggedIn: boolean;
  isPassCodeEntered: boolean;
  setIsPassCodeEntered: (bool: boolean) => void;
  setIsLoading: (bool: boolean) => void;
  setIsLoggedIn: (bool: boolean) => void;

  login: (loginProvider: LOGIN_PROVIDER_TYPE) => void;

  logout: () => void;
}

export const useLoginStore = create<LoginState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,

      isLoading: false,
      isPassCodeEntered: false,
      setIsPassCodeEntered: (bool: boolean) => set({isPassCodeEntered: bool}),
      setIsLoading: (bool: boolean) => set({isLoading: bool}),

      setIsLoggedIn: (bool: boolean) => set({isLoggedIn: bool}),

      login: async (loginProvider: LOGIN_PROVIDER_TYPE) => {
        const {setKernelClient} = useZeroDevStore.getState();
        const {setUserInfo, setWalletAddress} = useUserStore.getState();
        const {fetchBalance} = useBalanceStore.getState();

        try {
          set({isLoading: true});

          const {smartAccountSigner, user} = await web3AuthLogin(loginProvider);

          if (!user || !user?.email) {
            throw new Error('something went wrong with getting your account');
          }

          const isUserAlreadyRegistered = await checkIsUserAlreadyRegistered(
            user?.email,
          );

          RootNavigation.navigate(AUTH_SCREENS.CARD_CREATING, {
            isUserAlreadyRegistered: !!isUserAlreadyRegistered,
          });

          const kernelClient = await initZeroDevClient(smartAccountSigner);

          setKernelClient(kernelClient as KernelClient);

          const [givenName, familyName] = (user?.name || '')?.split(' ');

          const formattedUser = {
            id: user.idToken || '',
            name: user.name || '',
            email: user.email || '',
            photo: user.profileImage || '',
            givenName,
            familyName,
            loginProvider,
          };

          setUserInfo({...formattedUser, loginProvider});

          setWalletAddress(kernelClient.account.address);

          !isUserAlreadyRegistered && (await fetchBalance());

          await userSigninBackend(
            kernelClient.account.address,
            user.email || '',
          );

          set({isLoading: false});
        } catch (error) {
          console.log(`${loginProvider} login error: ${error}`);
          RootNavigation.navigate(AUTH_SCREENS.LOGIN);
        }
      },

      logout: async () => {
        const setIsLoggedIn = get().setIsLoggedIn;
        const {resetUser} = useUserStore.getState();
        const {resetBalances} = useBalanceStore.getState();
        const {setKernelClient} = useZeroDevStore.getState();
        const {resetPoints} = usePointsStore.getState();
        const {resetHistory} = useTransactionsHistoryStore.getState();
        try {
          const isLoggedOut = await logoutWeb3Auth();

          if (isLoggedOut) {
            resetUser();
            setIsLoggedIn(false);
            setKernelClient(null);
            resetBalances();
            resetPoints();
            resetHistory();
            resetKeychainCredentials();
            return true;
          }

          return false;
        } catch (error) {
          console.log(`web3Auth logout error: ${error}`);
          return false;
        }
      },
    }),
    {
      name: 'login-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        isLoggedIn: state.isLoggedIn,
      }),
    },
  ),
);
