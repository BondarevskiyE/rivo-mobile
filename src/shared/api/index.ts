import axios, {AxiosResponse} from 'axios';
import Config from 'react-native-config';
import {
  ApyResponse,
  PriceResponse,
  TRequestParams,
  TvlResponse,
  UserBalanceResponse,
} from './types';

const apiUrl = Config.RIVO_API_URL;

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

export const userSigninBackend = async (address: string): Promise<void> => {
  await sendRequest<void>({
    url: `${apiUrl}/v1/user/${address}/signin`,
  });
};

export const getUserBalance = async (
  address: string,
): Promise<UserBalanceResponse | null> => {
  return await sendRequest<UserBalanceResponse>({
    url: `${apiUrl}/v1/user/${address}/balance`,
  });
};

export const getFirstSigninUserBalance = async (
  address: string,
): Promise<void> => {
  await sendRequest<void>({
    url: `${apiUrl}/v1/user/${address}/balance_force`,
  });
};

export const getVaultTvl = async (
  address: string,
  chain: string,
): Promise<TvlResponse | null> => {
  return await sendRequest<TvlResponse | null>({
    url: `${apiUrl}/v1/chain/${chain}/vault/${address}/tvl`,
  });
};

export const getVaultPrice = async (
  address: string,
  chain: string,
): Promise<PriceResponse | null> => {
  return await sendRequest<PriceResponse>({
    url: `${apiUrl}/v1/chain/${chain}/vault/${address}/price`,
  });
};

export const getVaultApy = async (
  address: string,
  chain: string,
): Promise<ApyResponse | null> => {
  return await sendRequest<ApyResponse>({
    url: `${apiUrl}/v1/chain/${chain}/vault/${address}/apy`,
  });
};

export const getStrategyApy = async (
  address: string,
  chain: string,
): Promise<ApyResponse | null> => {
  return await sendRequest<ApyResponse>({
    url: `${apiUrl}/v1/chain/${chain}/strategy/${address}/apy`,
  });
};
