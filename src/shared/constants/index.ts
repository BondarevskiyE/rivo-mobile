import Config from 'react-native-config';

export const ZERODEV_API_KEY = Config.ZERODEV_API_KEY;

export const PINCODE_LENGTH = 4;

export const DEFAULT_USER_PHOTO =
  'https://upload.wikimedia.org/wikipedia/ru/9/94/%D0%93%D0%B8%D0%B3%D0%B0%D1%87%D0%B0%D0%B4.jpg?20220906144212';

export const BUNDLER_RPC = `https://rpc.zerodev.app/api/v2/bundler/${ZERODEV_API_KEY}`;
export const PAYMASTER_RPC = `https://rpc.zerodev.app/api/v2/paymaster/${ZERODEV_API_KEY}`;
