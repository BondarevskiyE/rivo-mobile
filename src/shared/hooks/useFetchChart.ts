import {useEffect, useState} from 'react';
import {CHART_PERIODS, ChartDotElement, ChartType} from '../types/chart';
import {
  getChartVaultApy,
  getChartVaultPrice,
  getChartVaultTvl,
  getChartVaultBalance,
} from '../api/chart';
import {useBalanceStore} from '@/store/useBalanceStore';
import {formatNumber} from '../lib/format';

interface Params {
  userAddress: string;
  vaultAddress: string;
  chain: string;
  period: CHART_PERIODS;
  type: ChartType;
}

type ReturnType = {isLoading: boolean; data: ChartDotElement[]};

const formatChartData = (data: any[], type?: ChartType): ChartDotElement[] => {
  return data.map(item => {
    return {
      value: type === 'balance' ? item?.balance : item?.value,
      date: new Date(item.date * 1000),
    };
  });
};

export const useFetchChart = ({
  userAddress,
  vaultAddress,
  chain,
  period,
  type,
}: Params): ReturnType => {
  const indexBalance = useBalanceStore(
    state => state.indexesBalanceMap?.[vaultAddress.toLowerCase()],
  );

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<ChartDotElement[]>([]);

  const fetchChartData = async () => {
    setIsLoading(true);
    let chartData = null;

    if (type === 'apy') {
      chartData = await getChartVaultApy(vaultAddress, chain, period);
    }

    if (type === 'price') {
      chartData = await getChartVaultPrice(vaultAddress, chain, period);
    }

    if (type === 'tvl') {
      chartData = await getChartVaultTvl(vaultAddress, chain, period);
    }

    if (type === 'balance') {
      // the last balance. indexBalance is loaded by forcing from blockchain so it is the actual balance
      const lastPriceChartDot = {
        balance: indexBalance.usd,
        date: (new Date().getTime() / 1000).toString(),
        want_tokens: indexBalance.token,
      };

      // while we load chartData we need to show the last balance
      setData(formatChartData([lastPriceChartDot], type));

      chartData = await getChartVaultBalance(userAddress, vaultAddress, period);
      if (
        formatNumber(
          chartData?.[chartData?.length - 1]?.balance || 0,
          7,
          '',
        ) !== formatNumber(indexBalance.usd, 7, '')
      ) {
        chartData?.push(lastPriceChartDot);
      }
    }

    chartData && setData(formatChartData(chartData, type));

    setIsLoading(false);
  };

  useEffect(() => {
    fetchChartData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vaultAddress, chain, period, type]);

  return {isLoading, data};
};
