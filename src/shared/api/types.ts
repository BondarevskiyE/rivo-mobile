import type {Method} from 'axios';

import {ChartDotElement} from '../types/chart';
import {Vault} from '../types';
import {IndexEarned} from '@/store/types';

export type TRequestParams<D> = {
  url: string;
  method?: Method;
  data?: D;
  params?: any;
  headers?: any;
  timeout?: number;
};

export type VaultInfoResponse = {
  value: number;
  date: string;
};

export type PriceResponse = VaultInfoResponse;
export type TvlResponse = VaultInfoResponse;
export type ApyResponse = VaultInfoResponse;

export type ChartResponse = ChartDotElement[];

export type UserBalanceResponse = {
  token_name: string;
  address: string;
  amount: number;
}[];

export type TotalUserBalanceResponse = {
  tokens: {
    token_name: string;
    address: string;
    amount: number;
  }[];
};

export type VaultResponse = Vault[];

export interface IndexUpdate {
  event: string;
  description: string;
  date: string;
}

export type EarnedIndexResponse = IndexEarned;
