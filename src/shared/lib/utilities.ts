import {Linking, Platform} from 'react-native';

export const getDeepLink = (path = '') => {
  const scheme = 'rivomobile';
  const prefix = Platform.OS == 'android' ? `${scheme}://` : `${scheme}://`;
  return prefix + path;
};

export const openLink = (link: string) => {
  const url = link.includes('http') ? link : getDeepLink(link);

  Linking.canOpenURL(url).then(isOk => {
    if (isOk) {
      Linking.openURL(url);
    }
  });
};
