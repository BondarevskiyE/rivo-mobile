import {KernelAccountClient, KernelSmartAccount} from '@zerodev/sdk';

import {LOGIN_PROVIDER_TYPE} from '@web3auth/react-native-sdk';
import {EntryPoint} from 'permissionless/types';
import {Transport, Chain} from 'viem';

export type User = {
  id: string;
  name: string | null;
  email: string;
  photo: string | null;
  familyName: string | null;
  givenName: string | null;
  loginProvider: LOGIN_PROVIDER_TYPE;
};

export type KernelClient = KernelAccountClient<
  EntryPoint,
  Transport,
  Chain,
  KernelSmartAccount<EntryPoint>
>;

export type DefiClient = KernelAccountClient<
  EntryPoint,
  Transport,
  Chain,
  KernelSmartAccount<EntryPoint>
>;
