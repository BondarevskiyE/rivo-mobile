declare module 'react-native-config' {
  export interface NativeConfig {
    RIVO_API_URL: string;
    WEB3AUTH_API_KEY: string;
    ZERODEV_API_KEY: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
