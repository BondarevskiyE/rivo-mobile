export enum HOME_SCREENS {
  HOME_SCREEN = 'home_screen',
  VAULT_SCREEN = 'vault_screen',
  RECEIVE_SCREEN = 'receive_screen',
  SEND_SCREEN = 'send_screen',
  SWAP_OR_BRIDGE_SCREEN = 'swap_or_bridge_screen',
  PURCHASE_OR_SELL_SCREEN = 'purchase_or_sell_screen',
}

export type HomeStackProps = {
  [HOME_SCREENS.HOME_SCREEN]: undefined;
  [HOME_SCREENS.VAULT_SCREEN]: {
    vaultId: string;
  };
  [HOME_SCREENS.RECEIVE_SCREEN]: undefined;
  [HOME_SCREENS.SEND_SCREEN]: undefined;
  [HOME_SCREENS.PURCHASE_OR_SELL_SCREEN]: undefined;
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
