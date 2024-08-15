export type Vault = {
  name: string;
  address: string;
  token_address: `0x${string}`;
  strategies: Strategy[];
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
  advantages: {image: string; text: string}[];
  audits?: Audit[];
  strategiesInside?: StrategyInside[];
};

export type Strategy = {
  chain: string;
  address: string;
};

export type StrategyInside = {
  name: string;
  owner: string;
  logoImageUrl: string;
  backgroundImageUrl: string;
  apy: string;
  allocation: string;
  tvl: string;
  riskScore: string;
  holders: string;
  description: string;
  yieldSources: YieldSource[];
};

export type YieldSource = {
  name: string;
  logoUrl: string;
};

export type Audit = {
  name: string;
  url: string;
  iconUrl: string;
};
