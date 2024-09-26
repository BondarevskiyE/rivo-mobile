import {Linking, Text} from 'react-native';

import * as RootNavigation from '@/navigation/RootNavigation';
import {
  ActionMenuButton,
  ButtonType,
} from '@/components/MenuActionButtons/types';
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
import {goToStore} from '@/shared/helpers/linking';

export const txHistoryButton = [
  {
    title: 'History',
    type: ButtonType.INTERNAL,
    action: () => {
      RootNavigation.navigate(PROFILE_SCREENS.TRANSACTION_HISTORY_SCREEN);
    },
  },
];

export const buttons: ActionMenuButton[] = [
  {
    title: 'Settings',
    type: ButtonType.INTERNAL,
    action: () => {
      RootNavigation.navigate(PROFILE_SCREENS.SETTINGS_MENU_SCREEN);
    },
    Icon: GearIcon,
  },
  {
    title: 'Help & Support',
    type: ButtonType.INTERNAL,
    action: () => {
      RootNavigation.navigate(PROFILE_SCREENS.HELP_AND_SUPPORT_SCREEN);
    },
    Icon: HelpSupportIcon,
  },
  {
    title: 'About Rivo',
    type: ButtonType.INTERNAL,
    action: () => {
      RootNavigation.navigate(PROFILE_SCREENS.ABOUT_RIVO_SCREEN);
    },
    Icon: InfoExclamationIcon,
  },
  {
    title: 'Rate us',
    type: ButtonType.INTERNAL,
    action: () => {
      goToStore();
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
    type: ButtonType.LINK,
    action: async () => {
      const isAppInstalled = await Linking.canOpenURL(
        'twitter://user?id=1684503851620089856',
      );
      if (isAppInstalled) {
        Linking.openURL('twitter://user?id=1684503851620089856');
        return;
      }

      Linking.canOpenURL('https://twitter.com/rivoxyz').then(supported => {
        supported && Linking.openURL('https://twitter.com/rivoxyz');
      });
    },
    Icon: XIcon,
  },
  {
    title: 'Telegram',
    type: ButtonType.LINK,
    action: async () => {
      const isAppInstalled = await Linking.canOpenURL(
        'tg://resolve?domain=rivoxyz_eng',
      );
      if (isAppInstalled) {
        Linking.openURL('tg://resolve?domain=rivoxyz_eng');
        return;
      }

      Linking.canOpenURL('https://t.me/rivoxyz_eng').then(supported => {
        supported && Linking.openURL('https://t.me/rivoxyz_eng');
      });
    },
    Icon: TelegramIcon,
  },
  {
    title: 'Discord',
    type: ButtonType.LINK,
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
    type: ButtonType.LINK,
    action: () => {
      Linking.canOpenURL('https://rivo.xyz/rivo-blog/').then(supported => {
        supported && Linking.openURL('https://rivo.xyz/rivo-blog/');
      });
    },
    Icon: BookIcon,
  },
];
