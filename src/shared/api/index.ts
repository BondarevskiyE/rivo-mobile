import axios, {AxiosResponse} from 'axios';
import Config from 'react-native-config';
import {
  ApyResponse,
  EarnedIndexResponse,
  IndexUpdate,
  PriceResponse,
  RegisterNotificationResponse,
  TRequestParams,
  TotalUserBalanceResponse,
  TvlResponse,
  // UserBalanceResponse,
  VaultResponse,
} from './types';
import {CHAINS} from '../constants';

export const apiUrl = Config.RIVO_API_URL;
export const LOCUS_API_URL = Config.LOCUS_API_URL;

export const sendRequest = async <T, D = object>({
  url,
  method = 'GET',
  data,
  params,
  headers,
  timeout,
}: TRequestParams<D>): Promise<T | null> => {
  try {
    const {data: responseData}: AxiosResponse<T> = await axios({
      method,
      url,
      headers: headers
        ? headers
        : {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
      data,
      params,
      timeout,
    });

    return responseData;
  } catch (err) {
    console.log('err', err);
    // @ts-ignore
    if (err.response && err.response.data) {
      // @ts-ignore
      const message = err.response.data.message;
      if (message) {
        // @ts-ignore
        throw new Error(err.response.data.message);
      }
    }
    return null;
  }
};

export const userSigninBackend = async (
  address: string,
  email: string,
): Promise<void> => {
  await sendRequest<void>({
    url: `${apiUrl}/v1/user/${address}/email/${email}/signin`,
  });
};

export const checkIsUserAlreadyRegistered = async (
  email: string,
): Promise<boolean | null> => {
  return await sendRequest<boolean>({
    url: `${apiUrl}/v1/user/email/${email}/is_already_registered`,
  });
};

// export const getUserBalance = async (
//   address: string,
// ): Promise<UserBalanceResponse | null> => {
//   return await sendRequest<UserBalanceResponse>({
//     url: `${apiUrl}/v1/user/${address}/balance`,
//   });
// };

// export const getUserBalanceForce = async (
//   address: string,
// ): Promise<UserBalanceResponse | null> => {
//   return await sendRequest<UserBalanceResponse>({
//     url: `${apiUrl}/v1/user/${address}/balance_force`,
//   });
// };

export const getTotalBalance = async (
  address: string,
): Promise<TotalUserBalanceResponse | null> => {
  return await sendRequest<TotalUserBalanceResponse>({
    url: `${apiUrl}/v1/user/${address}/total_balance`,
  });
};

export const getActiveVaults = async (): Promise<VaultResponse | null> => {
  return await sendRequest<VaultResponse>({
    url: `${apiUrl}/v1/active_vaults`,
  });
};

export const getVaultTvl = async (
  address: string,
  chain: CHAINS,
): Promise<TvlResponse | null> => {
  return await sendRequest<TvlResponse | null>({
    url: `${apiUrl}/v1/chain/${chain}/vault/${address}/last_tvl`,
  });
};

export const getVaultPrice = async (
  address: string,
  chain: CHAINS,
): Promise<PriceResponse | null> => {
  return await sendRequest<PriceResponse>({
    url: `${apiUrl}/v1/chain/${chain}/vault/${address}/last_price`,
  });
};

export const getVaultApy = async (
  address: string,
  chain: CHAINS,
): Promise<ApyResponse | null> => {
  return await sendRequest<ApyResponse>({
    url: `${apiUrl}/v1/chain/${chain}/vault/${address}/last_apy`,
  });
};

export const getStrategyApy = async (
  address: string,
  chain: CHAINS,
): Promise<ApyResponse | null> => {
  return await sendRequest<ApyResponse>({
    url: `${apiUrl}/v1/chain/${chain}/strategy/${address}/apy`,
  });
};

export const getHolders = async (address: string, chain: string) => {
  return await sendRequest<number>({
    url: `${apiUrl}/v1/chain/${chain}/address/${address}/holders`,
  });
};

export const getLastIndexUpdate = (
  chain: CHAINS,
  vaultName: string,
): Promise<IndexUpdate | null> => {
  return sendRequest<IndexUpdate>({
    url: `${LOCUS_API_URL}/chain/${chain}/vault/${vaultName}/last_update_info`,
  });
};

export const getAllIndexUpdates = (
  chain: CHAINS,
  vaultName: string,
): Promise<IndexUpdate[] | null> => {
  return sendRequest<IndexUpdate[]>({
    url: `${LOCUS_API_URL}/chain/${chain}/vault/${vaultName}/update_info`,
  });
};

export const getUserIndexEarned = (
  userAddress: string,
  vaultAddress: string,
): Promise<EarnedIndexResponse | null> => {
  return sendRequest<EarnedIndexResponse>({
    url: `${apiUrl}/v1/user/${userAddress}/index/${vaultAddress}/earned`,
  });
};

export const registerNotificationToken = (
  address: string,
  token: string,
): Promise<RegisterNotificationResponse | null> => {
  return sendRequest<RegisterNotificationResponse>({
    url: `${apiUrl}/v1/user/${address}/notification_token/${token}/register`,
  });
};
