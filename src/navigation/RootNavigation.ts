import {createNavigationContainerRef} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import {AuthStackProps, AUTH_SCREENS} from './types/authStack';
import {
  HomeStackProps,
  HOME_SCREENS,
  HOME_SCREEN_TABS,
  HomeTabsProps,
} from './types/homeStack';
import {PROFILE_SCREENS, ProfileStackProps} from './types/profileStack';
import {ROOT_STACKS, RootStackProps} from './types/rootStack';
import {POINTS_SCREENS, PointsStackProps} from './types/pointsStack';

type RootStackParamList = RootStackProps &
  AuthStackProps &
  HomeStackProps &
  HomeTabsProps &
  ProfileStackProps &
  PointsStackProps;

export type ScreenName =
  | ROOT_STACKS
  | HOME_SCREEN_TABS
  | HOME_SCREENS
  | AUTH_SCREENS
  | PROFILE_SCREENS
  | POINTS_SCREENS;

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate(
  name: ScreenName,
  params?: StackScreenProps<RootStackParamList>['route']['params'],
) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}
