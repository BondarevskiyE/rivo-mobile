import {LinkingOptions} from '@react-navigation/native';
import messaging from '@react-native-firebase/messaging';
import {Linking} from 'react-native';

import {ROOT_STACKS} from './types/rootStack';
import {HOME_SCREENS, HOME_SCREEN_TABS} from './types/homeStack';
import {PROFILE_SCREENS} from './types/profileStack';
import {POINTS_SCREENS} from './types/pointsStack';

// Deep links
export const deepLinksConf = {
  screens: {
    [ROOT_STACKS.HOME_STACK]: {
      screens: {
        [HOME_SCREENS.HOME_SCREEN_TABS]: {
          path: 'tabs',
          screens: {
            [HOME_SCREEN_TABS.OVERVIEW]: 'overview',
            [HOME_SCREEN_TABS.LIGHTING]: 'lighting',
            [HOME_SCREEN_TABS.CHARTS]: 'charts',
            [HOME_SCREEN_TABS.NOTIFICATIONS]: 'notifications',
          },
        },
        [HOME_SCREENS.VAULT_SCREEN]: 'vault/:vaultAddress',
        [HOME_SCREENS.INVEST_SCREEN]: 'invest/:vaultAddress',
        [HOME_SCREENS.RECEIVE_SCREEN]: 'receive',
        [HOME_SCREENS.SEND_SCREEN]: 'send',
        [HOME_SCREENS.PURCHASE_SCREEN]: 'purchase',
        [HOME_SCREENS.SELL_SCREEN]: 'sell',
        [HOME_SCREENS.SWAP_OR_BRIDGE_SCREEN]: 'swap_or_bridge',
      },
    },
    [ROOT_STACKS.PROFILE_STACK]: {
      screens: {
        [PROFILE_SCREENS.PROFILE_MENU_SCREEN]: 'profile',
        [PROFILE_SCREENS.SETTINGS_MENU_SCREEN]: 'settings',
        [PROFILE_SCREENS.HELP_AND_SUPPORT_SCREEN]: 'help_and_support',
        [PROFILE_SCREENS.ABOUT_RIVO_SCREEN]: 'about',
        [PROFILE_SCREENS.CHANGE_PASSCODE_SCREEN]: 'change_passcode',
        [PROFILE_SCREENS.TRANSACTION_HISTORY_SCREEN]:
          'transaction_history/:hash',
      },
    },
    [ROOT_STACKS.POINTS_STACK]: {
      screens: {
        [POINTS_SCREENS.POINTS_MENU_SCREEN]: 'points',
        [POINTS_SCREENS.LEADERBOARD_SCREEN]: 'leaderboard',
        [POINTS_SCREENS.POINTS_HISTORY_SCREEN]: 'points_history',
      },
    },
  },
};

export const linking: LinkingOptions<{}> = {
  prefixes: ['rivomobile://', 'https://app.rivomobile.com'],
  config: deepLinksConf,
  async getInitialURL() {
    // Check if app was opened from a deep link
    const url = await Linking.getInitialURL();

    console.log('initial url: ', url);

    if (url != null) {
      return url;
    }

    // Check if there is an initial firebase notification
    const message = await messaging().getInitialNotification();

    console.log('message?.data?.link: ', message);

    // Get deep link from data
    // if this is undefined, the app will open the default/home page
    return message?.data?.link as string;
  },
  subscribe(listener) {
    const onReceiveURL = ({url}: {url: string}) => listener(url);

    // Listen to incoming links from deep linking
    Linking.addEventListener('url', onReceiveURL);

    // Listen to firebase push notifications
    const unsubscribeNotification = messaging().onNotificationOpenedApp(
      message => {
        const url = message?.data?.link as string;

        console.log('subscribe', message);

        if (url) {
          // Any custom logic to check whether the URL needs to be handled

          // Call the listener to let React Navigation handle the URL
          listener(url);
        }
      },
    );

    return () => {
      // Clean up the event listeners
      Linking.removeAllListeners('url');
      unsubscribeNotification();
    };
  },
};
