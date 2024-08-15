export type TPendleStructRaw = {
  OffChainData: {
    YtToWantRate: string;
    WantToLpYtProportion: string[];
    PtToSyRate: string;
    SyToPtRate: string;
    LpToSyPtProportion: string[];
    PyToAssetRate: string;
    SyToAssetRate: string;
    nonce: string;
  };
  Signature: string;
};

export type TPendleStruct = {
  offChainData: {
    YtToWantRate: BigInt;
    WantToLpYtProportion: BigInt[];
    PtToSyRate: BigInt;
    SyToPtRate: BigInt;
    LpToSyPtProportion: BigInt[];
    PyToAssetRate: BigInt;
    SyToAssetRate: BigInt;
    nonce: number;
  }[];
  signatures: string[];
};
