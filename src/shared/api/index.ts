import axios, {AxiosResponse} from 'axios';
import Config from 'react-native-config';
import {
  ApyResponse,
  ChartResponse,
  PriceResponse,
  TRequestParams,
  TvlResponse,
  UserBalanceResponse,
  VaultResponse,
} from './types';
import {CHART_PERIODS} from '../types/chart';

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

export const getActiveVaults = async (): Promise<VaultResponse | null> => {
  return await sendRequest<VaultResponse>({
    url: `${apiUrl}/v1/active_vaults`,
  });
};

export const getVaultTvl = async (
  address: string,
  chain: string,
): Promise<TvlResponse | null> => {
  return await sendRequest<TvlResponse | null>({
    url: `${apiUrl}/v1/chain/${chain}/vault/${address}/last_tvl`,
  });
};

export const getVaultPrice = async (
  address: string,
  chain: string,
): Promise<PriceResponse | null> => {
  return await sendRequest<PriceResponse>({
    url: `${apiUrl}/v1/chain/${chain}/vault/${address}/last_price`,
  });
};

export const getVaultApy = async (
  address: string,
  chain: string,
): Promise<ApyResponse | null> => {
  return await sendRequest<ApyResponse>({
    url: `${apiUrl}/v1/chain/${chain}/vault/${address}/last_apy`,
  });
};

export const getChartVaultTvl = async (
  address: string,
  chain: string,
  period: CHART_PERIODS,
): Promise<ChartResponse | null> => {
  return await sendRequest<ChartResponse | null>({
    url: `${apiUrl}/v1/chain/${chain}/vault/${address}/tvl?period=${period}`,
  });
};

export const getChartVaultPrice = async (
  address: string,
  chain: string,
  period: CHART_PERIODS,
): Promise<ChartResponse | null> => {
  return await sendRequest<ChartResponse>({
    url: `${apiUrl}/v1/chain/${chain}/vault/${address}/price?period=${period}`,
  });
};

export const getChartVaultApy = async (
  address: string,
  chain: string,
  period: CHART_PERIODS,
): Promise<ChartResponse | null> => {
  return await sendRequest<ChartResponse>({
    url: `${apiUrl}/v1/chain/${chain}/vault/${address}/apy?period=${period}`,
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
