import {Linking, Text} from 'react-native';

import * as RootNavigation from '@/navigation/RootNavigation';
import {ActionMenuButton} from '@/components/MenuActionButtons/types';
import {PROFILE_SCREENS} from '@/navigation/types/profileStack';
import {Colors} from '@/shared/ui';
import {StarIcon} from '@/shared/ui/icons';
import {BookIcon} from '@/shared/ui/icons/BookIcon';
import {DiscordIcon} from '@/shared/ui/icons/DiscordIcon';
import {GearIcon} from '@/shared/ui/icons/GearIcon';
import {HelpSupportIcon} from '@/shared/ui/icons/HelpSupportIcon';
import {InfoExclamationIcon} from '@/shared/ui/icons/InfoExclamationIcon';
import {TelegramIcon} from '@/shared/ui/icons/TelegramIcon';
import {XIcon} from '@/shared/ui/icons/XIcon';
import {isAndroid, isIos} from '@/shared/helpers/system';
// import {openInAppBrowser} from '@/shared/helpers/url';

export const buttons: ActionMenuButton[] = [
  {
    title: 'Settings',
    type: 'internal',
    action: () => {
      RootNavigation.navigate(PROFILE_SCREENS.SETTINGS_MENU);
    },
    Icon: GearIcon,
  },
  {
    title: 'Help & Support',
    type: 'internal',
    action: () => {
      RootNavigation.navigate(PROFILE_SCREENS.HELP_AND_SUPPORT);
    },
    Icon: HelpSupportIcon,
  },
  {
    title: 'About Rivo',
    type: 'internal',
    action: () => {
      RootNavigation.navigate(PROFILE_SCREENS.ABOUT_RIVO);
    },
    Icon: InfoExclamationIcon,
  },
  {
    title: 'Rate us',
    type: 'internal',
    action: () => {
      if (isAndroid) {
        Linking.canOpenURL('market://details?id=rivomobile').then(supported => {
          supported && Linking.openURL('market://details?id=rivomobile');
        });
      }
      if (isIos) {
        Linking.canOpenURL(
          'itms-apps://itunes.apple.com/us/app/apple-store/rivomobile?mt=8',
        ).then(supported => {
          supported &&
            Linking.openURL(
              'itms-apps://itunes.apple.com/us/app/apple-store/rivomobile?mt=8',
            );
        });
      }
    },
    Icon: StarIcon,
  },
];

export const links: ActionMenuButton[] = [
  {
    title: (
      <Text>
        X <Text style={{color: Colors.ui_grey_70}}>/ Twitter</Text>
      </Text>
    ),
    type: 'link',
    action: () => {
      Linking.canOpenURL('https://twitter.com/rivoxyz').then(supported => {
        supported && Linking.openURL('https://twitter.com/rivoxyz');
      });
    },
    Icon: XIcon,
  },
  {
    title: 'Telegram',
    type: 'link',
    action: () => {
      Linking.canOpenURL('https://t.me/rivoxyz_eng').then(supported => {
        supported && Linking.openURL('https://t.me/rivoxyz_eng');
      });
    },
    Icon: TelegramIcon,
  },
  {
    title: 'Discord',
    type: 'link',
    action: () => {
      Linking.canOpenURL('https://discord.com/invite/9Vte5TfESf').then(
        supported => {
          supported && Linking.openURL('https://discord.com/invite/9Vte5TfESf');
        },
      );
    },
    Icon: DiscordIcon,
  },
  {
    title: 'Blog',
    type: 'link',
    action: () => {
      Linking.canOpenURL('https://rivo.xyz/rivo-blog/').then(supported => {
        supported && Linking.openURL('https://rivo.xyz/rivo-blog/');
      });
    },
    Icon: BookIcon,
  },
];
