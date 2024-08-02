import {create} from 'zustand';
import {LOGIN_PROVIDER_TYPE} from '@web3auth/react-native-sdk';

import * as RootNavigation from '@/navigation/RootNavigation';
import {useUserStore} from './useUserStore';
import {resetKeychainCredentials} from '@/services/keychain';
import {web3AuthLogin, logoutWeb3Auth} from '@/services/web3auth';
import {initZeroDevClient} from '@/services/zerodev';
import {useZeroDevStore} from './useZeroDevStore';
import {KernelAccount} from './types';
import {AUTH_SCREENS} from '@/navigation/types/authStack';
import {
  checkIsUserAlreadyRegistered,
  getFirstSigninUserBalance,
  userSigninBackend,
} from '@/shared/api';

interface LoginState {
  isLoading: boolean;
  isPassCodeEntered: boolean;
  setIsPassCodeEntered: (bool: boolean) => void;
  setIsLoading: (bool: boolean) => void;

  login: (loginProvider: LOGIN_PROVIDER_TYPE) => void;

  logout: () => void;
}

export const useLoginStore = create<LoginState>()(set => ({
  isLoading: false,
  isPassCodeEntered: false,
  setIsPassCodeEntered: (bool: boolean) => set({isPassCodeEntered: bool}),
  setIsLoading: (bool: boolean) => set({isLoading: bool}),

  login: async (loginProvider: LOGIN_PROVIDER_TYPE) => {
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

      const {setKernelAccount} = useZeroDevStore.getState();

      setKernelAccount(kernelClient as KernelAccount);

      const [givenName, familyName] = (user?.name || '')?.split(' ');

      const {setUserInfo, setWalletAddress} = useUserStore.getState();

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

      !isUserAlreadyRegistered &&
        (await getFirstSigninUserBalance(kernelClient.account.address));

      await userSigninBackend(kernelClient.account.address, user.email || '');

      set({isLoading: false});
    } catch (error) {
      console.log(`${loginProvider} login error: ${error}`);
      RootNavigation.navigate(AUTH_SCREENS.LOGIN);
    }
  },

  logout: async () => {
    try {
      const {setUserInfo, setWalletAddress, setIsLoggedIn} =
        useUserStore.getState();
      const {setKernelAccount} = useZeroDevStore.getState();

      const isLoggedOut = await logoutWeb3Auth();

      if (isLoggedOut) {
        setUserInfo(null);
        setWalletAddress('');
        setIsLoggedIn(false);
        setKernelAccount(null);
        resetKeychainCredentials();
        return true;
      }

      return false;
    } catch (error) {
      console.log(`web3Auth logout error: ${error}`);
      return false;
    }
  },
}));
