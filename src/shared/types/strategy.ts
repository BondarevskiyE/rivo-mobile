export type Strategy = {
  name: string;
  address: string;
  chain: string;
  shortDescription: string;
  description: string;
  logo: 'eth' | 'dollar';
  apy: number;
  tvl: number;
  allTvl: number;
  holders: number;
  riskLevel: number;
  price: number;
  id: string;
};

export type VaultPrice = {
  price: number;
  date: string;
};

export type VaultTvl = {
  tvl: number;
  date: string;
};

export type VaultApy = {
  apy: number;
  date: string;
};
