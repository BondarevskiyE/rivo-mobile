import {arbitrum, etherlink} from 'viem/chains';

export const chain = etherlink;

export enum CHAINS {
  ARB = 'ARB',
  ETHERLINK = 'ETHERLINK',
}

export const chainsMap: Record<number, CHAINS> = {
  [arbitrum.id]: CHAINS.ARB,
  [etherlink.id]: CHAINS.ETHERLINK,
};

export const chainIds = {
  [CHAINS.ARB]: arbitrum.id,
  [CHAINS.ETHERLINK]: etherlink.id,
};

export const scannerUrls = {
  [CHAINS.ARB]: 'https://arbiscan.io/',
  [CHAINS.ETHERLINK]: 'https://explorer.etherlink.com/',
};
