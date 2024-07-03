import {Platform} from 'react-native';

export const getDeepLink = (path = '') => {
  const scheme = 'rivomobile';
  const prefix = Platform.OS == 'android' ? `${scheme}://` : `${scheme}://`;
  return prefix + path;
};
