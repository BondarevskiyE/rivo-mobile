import {LinkingOptions} from '@react-navigation/native';
import messaging from '@react-native-firebase/messaging';

import {ROOT_STACKS} from './types/rootStack';
import {Linking} from 'react-native';

// Deep links
export const deepLinksConf = {
  screens: {
    HomeRoutes: {
      initialRouteName: ROOT_STACKS.HOME_STACK,
      screens: {
        Home: 'home',
        Vault: 'vault/:address',
        Invest: 'invest/:address',
        Receive: 'receive',
        Send: 'send',
        Purchase: 'purchase',
        Sell: 'sell',
        SwapOrBridge: 'swap_or_bridge',

        Overview: 'overview',
        Lighting: 'lighting',
        Charts: 'charts',
        Notifications: 'notifications',
      },
    },
    ProfileRoutes: {
      initialRouteName: ROOT_STACKS.PROFILE_STACK,
      screens: {
        ProfileMenu: 'profile_menu',
        SettingsMenu: 'settings_menu',
        HelpAndSupport: 'help_and_support',
        AboutRivo: 'about_rivo',
        ChangePasscode: 'change_passcode',
      },
    },
    PointsRoutes: {
      initialRouteName: ROOT_STACKS.POINTS_STACK,
      screens: {
        PointsMenu: 'points_menu',
        LeaderBoard: 'leaderboard',
      },
    },
  },
};

export const linkingMap: LinkingOptions<{}> = {
  prefixes: ['rivomobile://', 'https://app.rivomobile.com'],
  config: deepLinksConf,
  async getInitialURL() {
    // Check if app was opened from a deep link
    const url = await Linking.getInitialURL();

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
