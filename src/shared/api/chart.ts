import {apiUrl, sendRequest} from './';
import {CHART_PERIODS} from '../types/chart';
import {ChartResponse} from './types';

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

export const getChartVaultBalance = async (
  userAddress: string,
  vaultAddress: string,
  period: CHART_PERIODS,
): Promise<ChartResponse | null> => {
  return await sendRequest<ChartResponse | null>({
    url: `${apiUrl}/v1/user/${userAddress}/index/${vaultAddress}/balance_hist?period=${period}`,
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
