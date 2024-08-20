import {arbitrum} from 'viem/chains';

export const chain = arbitrum;

export type Chains = 'ARB';

export const chainIds = {
  ARB: arbitrum.id,
};

export const scannerUrls = {
  ARB: 'https://arbiscan.io/',
};
