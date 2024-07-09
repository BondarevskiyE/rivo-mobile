import {create} from 'zustand';
import {LOGIN_PROVIDER} from '@web3auth/react-native-sdk';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

import * as RootNavigation from '@/navigation/RootNavigation';
import {useUserStore} from './useUserStore';
import {resetKeychainCredentials} from '@/shared/lib/keychain';
import {signInWithTwitter} from '@/shared/lib/twitter';
import {initWeb3Auth, login} from '@/shared/lib/web3auth';
import {AUTH_SCREENS} from '@/navigation/AuthStack';
import {initZeroDevClient} from '@/shared/lib/zerodev';

GoogleSignin.configure({
  offlineAccess: true,
  iosClientId:
    '235832681635-3gr6a373koj6vl0ek64vlvtm6u4vrtjb.apps.googleusercontent.com',
  webClientId:
    '235832681635-c6jual4ctgrd7nvikti309cp8d7dqcmn.apps.googleusercontent.com',
});

interface LoginState {
  isLoading: boolean;
  isPassCodeEntered: boolean;
  setIsPassCodeEntered: (bool: boolean) => void;
  setIsLoading: (bool: boolean) => void;

  loginGoogle: () => Promise<boolean>;
  loginX: () => Promise<boolean>;

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

      await initWeb3Auth();

      const {smartAccountSigner, user} = await login(LOGIN_PROVIDER.GOOGLE);

      console.log('user: ', user);

      // RootNavigation.navigate(AUTH_SCREENS.CARD_CREATING);

      const kernelClient = await initZeroDevClient(smartAccountSigner);

      // await GoogleSignin.hasPlayServices();

      // const userInfo = await GoogleSignin.signIn();

      const {setUserInfo, setWalletAddress} = useUserStore.getState();

      // setUserInfo({...userInfo.user, loginProvider: LOGIN_PROVIDER.GOOGLE});

      // set({loginStep: LOGIN_STEPS.CARD_CREATING});

      setTimeout(() => {
        setWalletAddress('0x30713a9895E150D73fB7676D054814d30266F8F1'); // FIX change to backend api response
        set({isLoading: false});
      }, 3000);

      return true;
    } catch (error) {
      console.log(`Google login error: ${error}`);
      return false;
    }
  },
  loginX: async () => {
    try {
      set({isLoading: true});
      const user = await signInWithTwitter();

      if (!user) {
        throw new Error('Twitter oauth login error');
      }

      const {setUserInfo, setWalletAddress} = useUserStore.getState();

      setUserInfo({...user, loginProvider: LOGIN_PROVIDER.TWITTER});

      setTimeout(() => {
        setWalletAddress('0x30713a9895E150D73fB7676D054814d30266F8F1'); // FIX change to backend api response
        set({isLoading: false});
      }, 3000);

      return true;
    } catch (error) {
      console.log(`X login error: ${error}`);
      return false;
    }
  },
  logout: async () => {
    try {
      await GoogleSignin.signOut();

      const {setUserInfo, setWalletAddress, setIsLoggedIn} =
        useUserStore.getState();
      setUserInfo(null);
      setWalletAddress('');
      setIsLoggedIn(false);
      resetKeychainCredentials();

      return true;
    } catch (error) {
      console.log(`Google logout error: ${error}`);
      return false;
    }
  },
}));
