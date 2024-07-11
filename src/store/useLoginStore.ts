import {create} from 'zustand';
import {LOGIN_PROVIDER} from '@web3auth/react-native-sdk';

import * as RootNavigation from '@/navigation/RootNavigation';
import {useUserStore} from './useUserStore';
import {resetKeychainCredentials} from '@/shared/lib/keychain';
import {web3AuthLogin, logoutWeb3Auth} from '@/shared/lib/web3auth';
import {AUTH_SCREENS} from '@/navigation/AuthStack';
import {initZeroDevClient} from '@/shared/lib/zerodev';
import {useZeroDevStore} from './useZeroDevStore';
import {KernelAccount} from './types';

interface LoginState {
  isLoading: boolean;
  isPassCodeEntered: boolean;
  setIsPassCodeEntered: (bool: boolean) => void;
  setIsLoading: (bool: boolean) => void;

  loginGoogle: () => void;
  loginX: () => void;

  logout: () => void;
}

export const useLoginStore = create<LoginState>()(set => ({
  isLoading: false,
  isPassCodeEntered: false,
  setIsPassCodeEntered: (bool: boolean) => set({isPassCodeEntered: bool}),
  setIsLoading: (bool: boolean) => set({isLoading: bool}),

  loginGoogle: async () => {
    try {
      set({isLoading: true});

      const {smartAccountSigner, user} = await web3AuthLogin(
        LOGIN_PROVIDER.GOOGLE,
      );

      if (!user) {
        throw new Error('something went wrong with getting your account');
      }

      RootNavigation.navigate(AUTH_SCREENS.CARD_CREATING);

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
        loginProvider: LOGIN_PROVIDER.GOOGLE,
      };

      setUserInfo({...formattedUser, loginProvider: LOGIN_PROVIDER.GOOGLE});

      setWalletAddress(kernelClient.account.address);
      set({isLoading: false});
    } catch (error) {
      console.log(`Google login error: ${error}`);
    }
  },
  loginX: async () => {
    try {
      set({isLoading: true});

      const {smartAccountSigner, user} = await web3AuthLogin(
        LOGIN_PROVIDER.TWITTER,
      );

      if (!user) {
        throw new Error('something went wrong with getting your account');
      }

      RootNavigation.navigate(AUTH_SCREENS.CARD_CREATING);

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
        loginProvider: LOGIN_PROVIDER.GOOGLE,
      };

      setUserInfo({...formattedUser, loginProvider: LOGIN_PROVIDER.GOOGLE});

      setWalletAddress(kernelClient.account.address);
      set({isLoading: false});
    } catch (error) {
      console.log(`X login error: ${error}`);
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
