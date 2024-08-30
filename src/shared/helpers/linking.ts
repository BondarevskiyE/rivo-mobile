import {Linking} from 'react-native';
import {isIos} from './system';

export const goToSettings = () => {
  if (isIos) {
    Linking.openURL('app-settings:');
  } else {
    Linking.openSettings();
  }
};
