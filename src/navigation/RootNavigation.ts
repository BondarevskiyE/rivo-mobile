import {createNavigationContainerRef} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';

import {AUTH_SCREENS, AuthStackProps} from './AuthStack';
import {HOME_SCREENS, HomeStackProps} from './HomeStack';

type RootStackParamList = AuthStackProps & HomeStackProps;

type ScreenName = HOME_SCREENS | AUTH_SCREENS;

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate(
  name: ScreenName,
  params?: StackScreenProps<RootStackParamList>['route']['params'],
) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}
