export enum PROFILE_SCREENS {
  PROFILE_MENU = 'profile_menu',
  SETTINGS_MENU = 'settings_menu',
  HELP_AND_SUPPORT = 'help_and_support',
  ABOUT_RIVO = 'about_rivo',
}

export type ProfileStackProps = {
  [PROFILE_SCREENS.PROFILE_MENU]: undefined;
  [PROFILE_SCREENS.SETTINGS_MENU]: undefined;
  [PROFILE_SCREENS.HELP_AND_SUPPORT]: undefined;
  [PROFILE_SCREENS.ABOUT_RIVO]: undefined;
};
