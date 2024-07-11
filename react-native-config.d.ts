declare module 'react-native-config' {
  export interface NativeConfig {
    TWITTER_CONSUMER_KEY: string;
    TWITTER_CONSUMER_SECRET: string;
    WEB3AUTH_API_KEY: string;
    ZERODEV_API_KEY: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
