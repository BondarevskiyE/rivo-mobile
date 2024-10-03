import {Linking, Platform} from 'react-native';
import {openInAppBrowser} from '../helpers/url';

export const getDeepLink = (path = '') => {
  const scheme = 'rivomobile';
  const prefix = Platform.OS == 'android' ? `${scheme}://` : `${scheme}://`;
  return prefix + path;
};

export const openNotificationLink = (link: string) => {
  const isExternalLink = link.includes('http');

  const url = isExternalLink ? link : getDeepLink(link);

  Linking.canOpenURL(url).then(isOk => {
    if (isOk) {
      isExternalLink ? openInAppBrowser(url) : Linking.openURL(url);
    }
  });
};
