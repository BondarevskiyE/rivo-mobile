import {Linking} from 'react-native';
import {isAndroid, isIos} from './system';

export const goToSettings = () => {
  if (isIos) {
    Linking.openURL('app-settings:');
  } else {
    Linking.openSettings();
  }
};

export const goToStore = () => {
  if (isAndroid) {
    Linking.canOpenURL('market://details?id=rivomobile').then(supported => {
      supported && Linking.openURL('market://details?id=rivomobile');
    });
  }
  if (isIos) {
    Linking.canOpenURL(
      'itms-apps://itunes.apple.com/us/app/apple-store/rivomobile?mt=8',
    ).then(supported => {
      supported &&
        Linking.openURL(
          'itms-apps://itunes.apple.com/us/app/apple-store/rivomobile?mt=8',
        );
    });
  }
};
