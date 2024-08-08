import {useEffect, useState} from 'react';
import {CHART_PERIODS, ChartDotElement, ChartType} from '../types/chart';
import {getChartVaultApy, getChartVaultPrice, getChartVaultTvl} from '../api';

interface Params {
  address: string;
  chain: string;
  period: CHART_PERIODS;
  type: ChartType;
}

type ReturnType = {isLoading: boolean; data: ChartDotElement[]};

const formatChartData = (data: any[], type: ChartType) => {
  return data.map(item => ({
    value: item[type],
    date: new Date(item.date * 1000),
  }));
};

export const useFetchChart = ({
  address,
  chain,
  period,
  type,
}: Params): ReturnType => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<ChartDotElement[]>([]);

  const fetchChartData = async () => {
    setIsLoading(true);
    let chartData: ChartDotElement[] | null = null;

    if (type === 'apy') {
      chartData = await getChartVaultApy(address, chain, period);
    }

    if (type === 'price') {
      chartData = await getChartVaultPrice(address, chain, period);
    }

    if (type === 'tvl') {
      chartData = await getChartVaultTvl(address, chain, period);
    }

    chartData && setData(formatChartData(chartData, type));

    setIsLoading(false);
  };

  useEffect(() => {
    fetchChartData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, chain, period, type]);

  return {isLoading, data};
};
