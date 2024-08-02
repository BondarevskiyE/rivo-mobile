export enum AUTH_SCREENS {
  LOGIN = 'login',
  CARD_CREATING = 'card_creating',
  ENABLE_NOTIFICATIONS = 'enable_notifications',
  PASS_CODE_REGISTRATION = 'passcode_registration',
}

export type AuthStackProps = {
  [AUTH_SCREENS.LOGIN]: undefined;
  [AUTH_SCREENS.CARD_CREATING]: {isUserAlreadyRegistered: boolean};
  [AUTH_SCREENS.PASS_CODE_REGISTRATION]: undefined;
  [AUTH_SCREENS.ENABLE_NOTIFICATIONS]: undefined;
};
