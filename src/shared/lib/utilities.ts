import {Platform} from 'react-native';

export const getDeepLink = (path = '') => {
  const scheme = 'rivomobile';
  const prefix = Platform.OS == 'android' ? `${scheme}://app/` : `${scheme}://`;
  return prefix + path;
};
