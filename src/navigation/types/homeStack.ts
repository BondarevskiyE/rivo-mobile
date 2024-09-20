export enum HOME_SCREENS {
  HOME_SCREEN = 'home',
  VAULT_SCREEN = 'vault',
  INVEST_SCREEN = 'invest',
  RECEIVE_SCREEN = 'receive',
  SEND_SCREEN = 'send',
  SWAP_OR_BRIDGE_SCREEN = 'swap_or_bridge',
  PURCHASE_SCREEN = 'purchase',
  SELL_SCREEN = 'sell',
}

export type HomeStackProps = {
  [HOME_SCREENS.HOME_SCREEN]: undefined;
  [HOME_SCREENS.VAULT_SCREEN]: {
    vaultAddress: string;
  };
  [HOME_SCREENS.INVEST_SCREEN]: {
    vaultAddress: string;
  };
  [HOME_SCREENS.RECEIVE_SCREEN]: undefined;
  [HOME_SCREENS.SEND_SCREEN]: undefined;
  [HOME_SCREENS.PURCHASE_SCREEN]: undefined;
  [HOME_SCREENS.SELL_SCREEN]: undefined;
  [HOME_SCREENS.SWAP_OR_BRIDGE_SCREEN]: undefined;
};

export enum HOME_SCREEN_TABS {
  OVERVIEW = 'overview',
  LIGHTING = 'lighting',
  PLUS = 'plus',
  CHARTS = 'charts',
  NOTIFICATIONS = 'notifications',
}

export type HomeTabsProps = {
  [HOME_SCREEN_TABS.OVERVIEW]: undefined;
  [HOME_SCREEN_TABS.LIGHTING]: undefined;
  [HOME_SCREEN_TABS.PLUS]: undefined;
  [HOME_SCREEN_TABS.CHARTS]: undefined;
  [HOME_SCREEN_TABS.NOTIFICATIONS]: undefined;
};
