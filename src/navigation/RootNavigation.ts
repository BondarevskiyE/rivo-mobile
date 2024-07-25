import {createNavigationContainerRef} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import {AuthStackProps, AUTH_SCREENS} from './types/authStack';
import {HomeStackProps, HOME_SCREENS} from './types/homeStack';

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
