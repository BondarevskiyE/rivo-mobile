import Config from 'react-native-config';
export * from './chain';

export const ZERODEV_API_KEY = Config.ZERODEV_API_KEY;

export const PINCODE_LENGTH = 4;

export const DEFAULT_USER_PHOTO =
  'https://upload.wikimedia.org/wikipedia/ru/9/94/%D0%93%D0%B8%D0%B3%D0%B0%D1%87%D0%B0%D0%B4.jpg?20220906144212';

export const BUNDLER_RPC = `https://rpc.zerodev.app/api/v2/bundler/${ZERODEV_API_KEY}`;
export const PAYMASTER_RPC = `https://rpc.zerodev.app/api/v2/paymaster/${ZERODEV_API_KEY}`;

export const USDC_DECIMALS = 6;
export const WETH_DECIMALS = 18;

export const PENDLE_ETH_VAULT_ADDRESS =
  '0xA31eC4C877C65bEa5C5d4c307473624A0B377090';

export const USDC_ARBITRUM_ADDRESS =
  '0xaf88d065e77c8cc2239327c5edb3a432268e5831';
