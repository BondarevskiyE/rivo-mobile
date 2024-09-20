export enum ROOT_STACKS {
  HOME_STACK = 'home_stack',
  AUTH_STACK = 'auth_stack',
  PROFILE_STACK = 'profile_stack',
  POINTS_STACK = 'points_stack',
}

export type RootStackProps = {
  [ROOT_STACKS.HOME_STACK]: undefined;
  [ROOT_STACKS.AUTH_STACK]: undefined;
  [ROOT_STACKS.PROFILE_STACK]: undefined;
  [ROOT_STACKS.POINTS_STACK]: undefined;
};
