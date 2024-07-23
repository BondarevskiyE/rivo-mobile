export type Strategy = {
  name: string;
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
