import Config from 'react-native-config';

import {sendRequest} from './index';
import {TPendleStructRaw, TPendleStruct} from '../types/pendleStruct';

import {Strategy} from '../types';

const LOCUS_API_URL = Config.LOCUS_API_URL;

console.log(Config);

const fetchStructByStrategy = (
  strategyAddress: string,
): Promise<TPendleStructRaw | null> => {
  return sendRequest<TPendleStructRaw>({
    url: `${LOCUS_API_URL}/${strategyAddress}/get_pendle_struct`,
  });
};

const dataMapper = (structsRaw: TPendleStructRaw[]): TPendleStruct => {
  const offChainData = structsRaw.map(({OffChainData}) => {
    return {
      YtToWantRate: BigInt(OffChainData.YtToWantRate),
      WantToLpYtProportion: OffChainData.WantToLpYtProportion.map(w =>
        BigInt(w),
      ),
      PtToSyRate: BigInt(OffChainData.PtToSyRate),
      SyToPtRate: BigInt(OffChainData.SyToPtRate),
      LpToSyPtProportion: OffChainData.LpToSyPtProportion.map(w => BigInt(w)),
      PyToAssetRate: BigInt(OffChainData.PyToAssetRate),
      SyToAssetRate: BigInt(OffChainData.SyToAssetRate),
      nonce: Number(OffChainData.nonce),
    };
  });

  const signatures = structsRaw.map(({Signature}) => Signature);

  return {
    offChainData,
    signatures,
  };
};

export const fetchPendleStruct = async (
  strategies: Strategy[],
): Promise<TPendleStruct | null> => {
  const promises = strategies.map(strategy => {
    return fetchStructByStrategy(strategy.address);
  });

  const results = await Promise.all(promises);

  if (!results) {
    // FIX null
    return null;
  }

  return dataMapper(results as TPendleStructRaw[]);
};
