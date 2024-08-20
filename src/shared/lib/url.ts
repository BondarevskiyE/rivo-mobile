import * as WebBrowser from '@toruslabs/react-native-web-browser';

export const openInAppBrowser = async (url: string) => {
  const result = await WebBrowser.openBrowserAsync(url);

  return result;
};
