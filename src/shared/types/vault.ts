import {CHAINS} from '../constants';

export type Vault = {
  name: string;
  address: string;
  token_address: `0x${string}`;
  strategies: Strategy[];
  chain: CHAINS;
  short_description: string;
  description: string;
  logo: 'eth' | 'dollar';
  apy: number;
  tvl: number;
  max_tvl_cap: number;
  holders: number;
  risk_level: number;
  price: number;
  advantages: {image: string; text: string}[];
  mechanics: string;
  maintance: string;
  rewards: string;
  smart_ctr_sec_score: number;
  smart_ctr_sec_text: string;
  user_metrics_score: number;
  user_metrics_text: string;
  complexity_score: number;
  complexity_text: string;
  quality_underlying_asset_score: number;
  quality_underlying_asset_text: string;
  perf_fee_image: string;
  managment_fee_image: string;
  audits?: Audit[];
};

export type Strategy = {
  chain: CHAINS;
  address: string;
  name: string;
  protocol: string;
  logo_image_url: string;
  bg_image_url: string;
  apy: number;
  allocation: string;
  tvl: string;
  risk_score: string;
  holders: string;
  overview: string;
  tags: SourceTag[];
};

export type SourceTag = {
  text: string;
  image: string;
};

export type Audit = {
  text: string;
  url: string;
  image: string;
};
