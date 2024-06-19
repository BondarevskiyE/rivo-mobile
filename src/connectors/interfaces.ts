import {
  ExtraLoginOptions,
  LOGIN_PROVIDER_TYPE,
} from '@web3auth/react-native-sdk';
import type {CustomChainConfig} from '@web3auth/base';
import Web3Auth from '@web3auth/react-native-sdk/dist/types/Web3Auth';
import {EthereumPrivateKeyProvider} from '@web3auth/ethereum-provider';
import {Chain} from 'viem';
import {EntryPoint} from 'permissionless/types';

interface ZeroDevOptions {
  entryPoint: EntryPoint;
  chain: Chain;
  bundlerRPC: string;
  paymasterRPC: string;
}

export interface Web3AuthZeroDevConnector {
  web3AuthInstance: Web3Auth;
  loginParams?: {
    loginProvider: LOGIN_PROVIDER_TYPE;
    redirectUrl: string;
    extraLoginOptions?: ExtraLoginOptions;
  };
  zeroDevOptions: ZeroDevOptions;
  chainConfig: CustomChainConfig;
  id?: string;
}

export type Provider = EthereumPrivateKeyProvider;
