export enum PROFILE_SCREENS {
  PROFILE_MENU_SCREEN = 'profile_menu',
  SETTINGS_MENU_SCREEN = 'settings_menu',
  HELP_AND_SUPPORT_SCREEN = 'help_and_support',
  ABOUT_RIVO_SCREEN = 'about_rivo',
  CHANGE_PASSCODE_SCREEN = 'change_passcode',
}

export type ProfileStackProps = {
  [PROFILE_SCREENS.PROFILE_MENU_SCREEN]: undefined;
  [PROFILE_SCREENS.SETTINGS_MENU_SCREEN]: undefined;
  [PROFILE_SCREENS.HELP_AND_SUPPORT_SCREEN]: undefined;
  [PROFILE_SCREENS.ABOUT_RIVO_SCREEN]: undefined;
  [PROFILE_SCREENS.CHANGE_PASSCODE_SCREEN]: undefined;
};
