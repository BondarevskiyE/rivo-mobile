export type ChartDotElement = {
  value: number;
  date: Date;
};

export type ChartPeriod = '1M' | '3M' | 'ALL';

export type ChartType = 'price' | 'tvl' | 'apy' | 'balance';

export enum CHART_PERIODS {
  WEEK = '1W',
  MONTH = '1M',
  THREE_MONTHS = '3M',
  MAX = 'ALL',
}
