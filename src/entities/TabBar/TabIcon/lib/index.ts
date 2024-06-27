import {TABS} from '@/routes/AppStack';
import {
  BellIcon,
  ChartsIcon,
  LightingIcon,
  PlusIcon,
  WalletIcon,
} from '@/shared/ui/icons';

export const getIconByName = (tabName: TABS) => {
  switch (tabName) {
    case TABS.OVERVIEW:
      return WalletIcon;
    case TABS.LIGHTING:
      return LightingIcon;
    case TABS.PLUS:
      return PlusIcon;
    case TABS.CHARTS:
      return ChartsIcon;
    case TABS.NOTIFICATIONS:
      return BellIcon;
  }
};
