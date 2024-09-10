import {createNavigationContainerRef} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import {AuthStackProps, AUTH_SCREENS} from './types/authStack';
import {HomeStackProps, HOME_SCREENS} from './types/homeStack';
import {PROFILE_SCREENS, ProfileStackProps} from './types/profileStack';
import {ROOT_STACKS, RootStackProps} from './types/rootStack';

type RootStackParamList = RootStackProps &
  AuthStackProps &
  HomeStackProps &
  ProfileStackProps;

export type ScreenName =
  | ROOT_STACKS
  | HOME_SCREENS
  | AUTH_SCREENS
  | PROFILE_SCREENS;

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate(
  name: ScreenName,
  params?: StackScreenProps<RootStackParamList>['route']['params'],
) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}
