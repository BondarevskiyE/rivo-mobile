import type {Method} from 'axios';

import {VaultApy, VaultPrice, VaultTvl} from '../types/strategy';

export type TRequestParams<D> = {
  url: string;
  method?: Method;
  data?: D;
  params?: any;
  headers?: any;
  timeout?: number;
};

export type PriceResponse = VaultPrice[];
export type TvlResponse = VaultTvl[];
export type ApyResponse = VaultApy[];

export type UserBalanceResponse = {
  token_name: string;
  address: string;
  amount: number;
}[];
