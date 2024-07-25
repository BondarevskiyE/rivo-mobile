import {HOME_SCREEN_TABS} from '@/navigation/types/homeStack';
import {
  BellIcon,
  ChartsIcon,
  LightingIcon,
  PlusIcon,
  WalletIcon,
} from '@/shared/ui/icons';

export const getIconByName = (tabName: HOME_SCREEN_TABS) => {
  switch (tabName) {
    case HOME_SCREEN_TABS.OVERVIEW:
      return WalletIcon;
    case HOME_SCREEN_TABS.LIGHTING:
      return LightingIcon;
    case HOME_SCREEN_TABS.PLUS:
      return PlusIcon;
    case HOME_SCREEN_TABS.CHARTS:
      return ChartsIcon;
    case HOME_SCREEN_TABS.NOTIFICATIONS:
      return BellIcon;
  }
};
