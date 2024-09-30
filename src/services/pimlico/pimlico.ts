import {Abi, EIP1193Provider, createPublicClient, http} from 'viem';
import {createPimlicoClient} from 'permissionless/clients/pimlico';
import {
  GetUserOperationReceiptReturnType,
  bundlerActions,
  entryPoint07Address,
} from 'viem/account-abstraction';
import {toEcdsaKernelSmartAccount} from 'permissionless/accounts';
import {SmartAccountClient, createSmartAccountClient} from 'permissionless';

import {chain} from '@/shared/constants/chain';
import {
  PIMLICO_URL,
  USDC_DECIMALS,
  USDC_ETHERLINK_ADDRESS,
  ZERODEV_API_KEY,
} from '@/shared/constants';
import {getTokenValueBigInt} from '@/shared/lib/bigInt';
import {createKernelDefiClient} from '@zerodev/defi';
import {Alert} from 'react-native';
import {etherlink} from 'viem/chains';

export const initPimlicoClient = async (smartAccountOwner: EIP1193Provider) => {
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });

  const pimlicoClient = createPimlicoClient({
    transport: http(PIMLICO_URL),
    entryPoint: {
      address: entryPoint07Address,
      version: '0.7',
    },
  });

  const kernelSmartAccount = await toEcdsaKernelSmartAccount({
    owners: [smartAccountOwner],
    client: publicClient,
    entryPoint: {
      address: entryPoint07Address,
      version: '0.7',
    },
  });

  const simpleAccount = await toSimpleSmartAccount({
    client: publicClient,
    owner: privateKeyToAccount('0x...'),
    entryPoint: {
      address: entryPoint07Address,
      version: '0.7',
    },
  });

  const smartAccountClient = createSmartAccountClient({
    account: kernelSmartAccount,
    chain,
    bundlerTransport: http(PIMLICO_URL),
    paymaster: pimlicoClient,
    userOperation: {
      estimateFeesPerGas: async () => {
        return (await pimlicoClient.getUserOperationGasPrice()).fast;
      },
    },
  });

  return smartAccountClient;
};

interface SwapUsdcToTokenParams {
  toTokenAddress: string;
  amount: string;
}

interface SwapTokenToUsdcParams {
  fromTokenAddress: string;
  amount: bigint;
}

interface InvestUserOperationParams {
  investTokenAddress: `0x${string}`;
  vaultTokenContractAddress: `0x${string}`;
  vaultTokenContractAbi: Abi | unknown[];
  investAmount: bigint;
}

class Pimlico {
  #smartAccountClient: SmartAccountClient | null = null;

  constructor() {}

  // initialization with existing smartAccountClient
  init(smartAccountClient: SmartAccountClient) {
    this.#smartAccountClient = smartAccountClient;
  }

  // nitialization with creating new smartAccountClient from web3Auth smartAccountOwner
  async createClient(smartAccountOwner: EIP1193Provider) {
    const publicClient = createPublicClient({
      chain, // or whatever chain you are using
      transport: http(),
    });

    const pimlicoClient = createPimlicoClient({
      transport: http(PIMLICO_URL),
      entryPoint: {
        address: entryPoint07Address,
        version: '0.7',
      },
    });

    const kernelSmartAccount = await toEcdsaKernelSmartAccount({
      owners: [smartAccountOwner],
      client: publicClient,
      entryPoint: {
        address: entryPoint07Address,
        version: '0.7',
      },
    });

    const smartAccountClient = createSmartAccountClient({
      account: kernelSmartAccount,
      chain,
      bundlerTransport: http(PIMLICO_URL),
      paymaster: pimlicoClient,
      userOperation: {
        estimateFeesPerGas: async () => {
          return (await pimlicoClient.getUserOperationGasPrice()).fast;
        },
      },
    });

    this.#smartAccountClient = smartAccountClient;

    return smartAccountClient;
  }

  async swapUsdcToToken({toTokenAddress, amount}: SwapUsdcToTokenParams) {
    try {
      const defiClient = createKernelDefiClient(
        this.#smartAccountClient,
        ZERODEV_API_KEY,
      );

      const userOpHash = await defiClient.sendSwapUserOp({
        fromToken: USDC_ETHERLINK_ADDRESS,
        fromAmount: getTokenValueBigInt(amount, USDC_DECIMALS),
        toToken: toTokenAddress,

        gasToken: 'sponsored',
      });

      const bundlerClient = this.#smartAccountClient?.extend(
        // @ts-ignore
        bundlerActions(entryPoint07Address),
      );
      // @ts-ignore
      const receipt = await bundlerClient?.waitForUserOperationReceipt({
        hash: userOpHash,
      });

      return receipt;
    } catch (error) {
      console.log(error);
      Alert.alert(`swapUsdcToToken error: ${error}`);
    }
  }

  async swapTokenToUsdc({
    fromTokenAddress,
    amount,
  }: SwapTokenToUsdcParams): Promise<GetUserOperationReceiptReturnType> {
    const defiClient = createKernelDefiClient(
      this.#smartAccountClient,
      ZERODEV_API_KEY,
    );

    const swapToUSDCUserOpHash = await defiClient.sendSwapUserOp({
      fromToken: fromTokenAddress,
      fromAmount: amount,
      toToken: USDC_ETHERLINK_ADDRESS,

      gasToken: 'sponsored',
    });

    const bundlerClient = this.#smartAccountClient?.extend(
      // @ts-ignore
      bundlerActions(entryPoint07Address),
    );

    // @ts-ignore
    const receipt = await bundlerClient?.waitForUserOperationReceipt({
      hash: swapToUSDCUserOpHash,
    });

    return receipt;
  }

  sendUSDCToAddress = async (
    amount: string,
    toAddress: `0x${string}`,
  ): Promise<GetUserOperationReceiptReturnType> => {
    const tokenAmountBigInt = getTokenValueBigInt(amount, USDC_DECIMALS);

    const sendUserOperationData = {
      callData: await kernelClient.account.encodeCallData([
        {
          to: USDC_ARBITRUM_ADDRESS,
          value: BigInt(0),
          data: encodeFunctionData({
            abi: ERC20ABI,
            functionName: 'transfer',
            args: [toAddress, tokenAmountBigInt],
          }),
        },
      ]),
    };

    const userOpSendTxHash = await kernelClient.sendUserOperation({
      userOperation: {
        ...sendUserOperationData,
        // callGasLimit:
        //   (withdrawUserOp.callGasLimit * BigInt(GAS_MULTIPLIER)) / BigInt(100),
      },
      // @ts-ignore FIX why type is incompitible
      account: kernelClient.account,
    });

    // @ts-ignore
    const bundlerClient = kernelClient.extend(bundlerActions(entryPoint));
    const receipt = await bundlerClient.waitForUserOperationReceipt({
      hash: userOpSendTxHash,
    });

    return receipt;
  };

  //   sendInvestUserOperation = async ({
  //     investTokenAddress,
  //     vaultTokenContractAddress,
  //     vaultTokenContractAbi,
  //     investAmount,
  //   }: InvestUserOperationParams): Promise<GetUserOperationReceiptReturnType> => {
  //     const kernelClient = useZeroDevStore.getState()
  //       .kernelClient as KernelClient;

  //     if (!kernelClient) {
  //       throw new Error('no kernelClient');
  //     }

  //     const investUserOperationData = {
  //       callData: await kernelClient.account.encodeCallData([
  //         {
  //           to: investTokenAddress,
  //           value: BigInt(0),
  //           data: encodeFunctionData({
  //             abi: ERC20ABI,
  //             functionName: 'approve',
  //             args: [vaultTokenContractAddress, investAmount],
  //           }),
  //         },
  //         {
  //           to: vaultTokenContractAddress,
  //           value: BigInt(0),
  //           data: encodeFunctionData({
  //             abi: vaultTokenContractAbi,
  //             functionName: 'deposit',
  //             args: [investAmount],
  //           }),
  //         },
  //       ]),
  //     };

  //     const investUserOp = await kernelClient.prepareUserOperationRequest({
  //       userOperation: investUserOperationData,
  //       // @ts-ignore FIX why type is incompitible
  //       account: kernelClient.account,
  //     });

  //     const userOpInvestTxHash = await kernelClient.sendUserOperation({
  //       userOperation: {
  //         ...investUserOperationData,
  //         callGasLimit:
  //           (investUserOp.callGasLimit * BigInt(GAS_MULTIPLIER)) / BigInt(100),
  //       },
  //       // @ts-ignore FIX why type is incompitible
  //       account: kernelClient.account,
  //     });

  //     // @ts-ignore
  //     const bundlerClient = await kernelClient.extend(bundlerActions(entryPoint));

  //     const investTxReceipt = await bundlerClient.waitForUserOperationReceipt({
  //       hash: userOpInvestTxHash,
  //     });

  //     return investTxReceipt;
  //   };
}

export const PimlicoAAClient = new Pimlico();
function toSimpleSmartAccount(arg0: {
  client: {
    account: undefined;
    batch?:
      | {
          multicall?:
            | boolean
            | {batchSize?: number | undefined; wait?: number | undefined}
            | undefined;
        }
      | undefined;
    cacheTime: number;
    ccipRead?:
      | false
      | {
          request?:
            | ((
                parameters: import('viem').CcipRequestParameters,
              ) => Promise<`0x${string}`>)
            | undefined;
        }
      | undefined;
    chain: {
      blockExplorers: {
        readonly default: {
          readonly name: 'Arbiscan';
          readonly url: 'https://arbiscan.io';
          readonly apiUrl: 'https://api.arbiscan.io/api';
        };
      };
      contracts: {
        readonly multicall3: {
          readonly address: '0xca11bde05977b3631167028862be2a173976ca11';
          readonly blockCreated: 7654707;
        };
      };
      id: 42161;
      name: 'Arbitrum One';
      nativeCurrency: {
        readonly name: 'Ether';
        readonly symbol: 'ETH';
        readonly decimals: 18;
      };
      rpcUrls: {
        readonly default: {
          readonly http: readonly ['https://arb1.arbitrum.io/rpc'];
        };
      };
      sourceId?: number | undefined;
      testnet?: boolean | undefined;
      custom?: Record<string, unknown> | undefined;
      fees?: import('viem').ChainFees<undefined> | undefined;
      formatters?: undefined;
      serializers?:
        | import('viem').ChainSerializers<
            undefined,
            import('viem').TransactionSerializable<bigint, number>
          >
        | undefined;
    };
    key: string;
    name: string;
    pollingInterval: number;
    request: import('viem').EIP1193RequestFn<import('viem').PublicRpcSchema>;
    transport: import('viem').TransportConfig<
      'http',
      import('viem').EIP1193RequestFn
    > & {
      fetchOptions?: Omit<RequestInit, 'body'> | undefined;
      url?: string | undefined;
    };
    type: string;
    uid: string;
    call: (
      parameters: import('viem').CallParameters<{
        blockExplorers: {
          readonly default: {
            readonly name: 'Arbiscan';
            readonly url: 'https://arbiscan.io';
            readonly apiUrl: 'https://api.arbiscan.io/api';
          };
        };
        contracts: {
          readonly multicall3: {
            readonly address: '0xca11bde05977b3631167028862be2a173976ca11';
            readonly blockCreated: 7654707;
          };
        };
        id: 42161;
        name: 'Arbitrum One';
        nativeCurrency: {
          readonly name: 'Ether';
          readonly symbol: 'ETH';
          readonly decimals: 18;
        };
        rpcUrls: {
          readonly default: {
            readonly http: readonly ['https://arb1.arbitrum.io/rpc'];
          };
        };
        sourceId?: number | undefined;
        testnet?: boolean | undefined;
        custom?: Record<string, unknown> | undefined;
        fees?: import('viem').ChainFees<undefined> | undefined;
        formatters?: undefined;
        serializers?:
          | import('viem').ChainSerializers<
              undefined,
              import('viem').TransactionSerializable<bigint, number>
            >
          | undefined;
      }>,
    ) => Promise<import('viem').CallReturnType>;
    createBlockFilter: () => Promise<{
      id: `0x${string}`;
      request: import('viem').EIP1193RequestFn<
        readonly [
          {
            Method: 'eth_getFilterChanges';
            Parameters: [filterId: `0x${string}`];
            ReturnType: `0x${string}`[] | import('viem').RpcLog[];
          },
          {
            Method: 'eth_getFilterLogs';
            Parameters: [filterId: `0x${string}`];
            ReturnType: import('viem').RpcLog[];
          },
          {
            Method: 'eth_uninstallFilter';
            Parameters: [filterId: `0x${string}`];
            ReturnType: boolean;
          },
        ]
      >;
      type: 'block';
    }>;
    createContractEventFilter: <
      const abi extends Abi | readonly unknown[],
      eventName extends import('viem').ContractEventName<abi> | undefined,
      args extends
        | import('viem').MaybeExtractEventArgsFromAbi<abi, eventName>
        | undefined,
      strict extends boolean | undefined = undefined,
      fromBlock extends
        | bigint
        | import('viem').BlockTag
        | undefined = undefined,
      toBlock extends bigint | import('viem').BlockTag | undefined = undefined,
    >(
      args: import('viem').CreateContractEventFilterParameters<
        abi,
        eventName,
        args,
        strict,
        fromBlock,
        toBlock
      >,
    ) => Promise<
      import('viem').CreateContractEventFilterReturnType<
        abi,
        eventName,
        args,
        strict,
        fromBlock,
        toBlock
      >
    >;
    createEventFilter: <
      const abiEvent extends import('viem').AbiEvent | undefined = undefined,
      const abiEvents extends
        | readonly unknown[]
        | readonly import('viem').AbiEvent[]
        | undefined = abiEvent extends import('viem').AbiEvent
        ? [abiEvent]
        : undefined,
      strict extends boolean | undefined = undefined,
      fromBlock extends
        | bigint
        | import('viem').BlockTag
        | undefined = undefined,
      toBlock extends bigint | import('viem').BlockTag | undefined = undefined,
      _EventName extends
        | string
        | undefined = import('viem').MaybeAbiEventName<abiEvent>,
      _Args extends
        | import('viem').MaybeExtractEventArgsFromAbi<abiEvents, _EventName>
        | undefined = undefined,
    >(
      args?:
        | import('viem').CreateEventFilterParameters<
            abiEvent,
            abiEvents,
            strict,
            fromBlock,
            toBlock,
            _EventName,
            _Args
          >
        | undefined,
    ) => Promise<{
      [K in keyof import('viem').Filter<
        'event',
        abiEvents,
        _EventName,
        _Args,
        strict,
        fromBlock,
        toBlock
      >]: import('viem').Filter<
        'event',
        abiEvents,
        _EventName,
        _Args,
        strict,
        fromBlock,
        toBlock
      >[K];
    }>;
    createPendingTransactionFilter: () => Promise<{
      id: `0x${string}`;
      request: import('viem').EIP1193RequestFn<
        readonly [
          {
            Method: 'eth_getFilterChanges';
            Parameters: [filterId: `0x${string}`];
            ReturnType: `0x${string}`[] | import('viem').RpcLog[];
          },
          {
            Method: 'eth_getFilterLogs';
            Parameters: [filterId: `0x${string}`];
            ReturnType: import('viem').RpcLog[];
          },
          {
            Method: 'eth_uninstallFilter';
            Parameters: [filterId: `0x${string}`];
            ReturnType: boolean;
          },
        ]
      >;
      type: 'transaction';
    }>;
    estimateContractGas: <
      chain extends import('viem').Chain | undefined,
      const abi extends Abi | readonly unknown[],
      functionName extends import('viem').ContractFunctionName<
        abi,
        'nonpayable' | 'payable'
      >,
      args extends import('viem').ContractFunctionArgs<
        abi,
        'nonpayable' | 'payable',
        functionName
      >,
    >(
      args: import('viem').EstimateContractGasParameters<
        abi,
        functionName,
        args,
        chain
      >,
    ) => Promise<bigint>;
    estimateGas: (
      args: import('viem').EstimateGasParameters<{
        blockExplorers: {
          readonly default: {
            readonly name: 'Arbiscan';
            readonly url: 'https://arbiscan.io';
            readonly apiUrl: 'https://api.arbiscan.io/api';
          };
        };
        contracts: {
          readonly multicall3: {
            readonly address: '0xca11bde05977b3631167028862be2a173976ca11';
            readonly blockCreated: 7654707;
          };
        };
        id: 42161;
        name: 'Arbitrum One';
        nativeCurrency: {
          readonly name: 'Ether';
          readonly symbol: 'ETH';
          readonly decimals: 18;
        };
        rpcUrls: {
          readonly default: {
            readonly http: readonly ['https://arb1.arbitrum.io/rpc'];
          };
        };
        sourceId?: number | undefined;
        testnet?: boolean | undefined;
        custom?: Record<string, unknown> | undefined;
        fees?: import('viem').ChainFees<undefined> | undefined;
        formatters?: undefined;
        serializers?:
          | import('viem').ChainSerializers<
              undefined,
              import('viem').TransactionSerializable<bigint, number>
            >
          | undefined;
      }>,
    ) => Promise<bigint>;
    getBalance: (args: import('viem').GetBalanceParameters) => Promise<bigint>;
    getBlobBaseFee: () => Promise<bigint>;
    getBlock: <
      includeTransactions extends boolean = false,
      blockTag extends import('viem').BlockTag = 'latest',
    >(
      args?:
        | import('viem').GetBlockParameters<includeTransactions, blockTag>
        | undefined,
    ) => Promise<{
      number: blockTag extends 'pending' ? null : bigint;
      hash: blockTag extends 'pending' ? null : `0x${string}`;
      nonce: blockTag extends 'pending' ? null : `0x${string}`;
      logsBloom: blockTag extends 'pending' ? null : `0x${string}`;
      baseFeePerGas: bigint | null;
      blobGasUsed: bigint;
      difficulty: bigint;
      excessBlobGas: bigint;
      extraData: `0x${string}`;
      gasLimit: bigint;
      gasUsed: bigint;
      miner: `0x${string}`;
      mixHash: `0x${string}`;
      parentHash: `0x${string}`;
      receiptsRoot: `0x${string}`;
      sealFields: `0x${string}`[];
      sha3Uncles: `0x${string}`;
      size: bigint;
      stateRoot: `0x${string}`;
      timestamp: bigint;
      totalDifficulty: bigint | null;
      transactionsRoot: `0x${string}`;
      uncles: `0x${string}`[];
      withdrawals?: import('viem').Withdrawal[] | undefined;
      withdrawalsRoot?: `0x${string}` | undefined;
      transactions: includeTransactions extends true
        ? (
            | {
                yParity?: undefined;
                from: `0x${string}`;
                gas: bigint;
                hash: `0x${string}`;
                input: `0x${string}`;
                nonce: number;
                r: `0x${string}`;
                s: `0x${string}`;
                to: `0x${string}` | null;
                typeHex: `0x${string}` | null;
                v: bigint;
                value: bigint;
                accessList?: undefined;
                authorizationList?: undefined;
                blobVersionedHashes?: undefined;
                chainId?: number | undefined;
                type: 'legacy';
                gasPrice: bigint;
                maxFeePerBlobGas?: undefined;
                maxFeePerGas?: undefined;
                maxPriorityFeePerGas?: undefined;
                blockHash: (
                  blockTag extends 'pending' ? true : false
                ) extends true
                  ? null
                  : `0x${string}`;
                blockNumber: (
                  blockTag extends 'pending' ? true : false
                ) extends true
                  ? null
                  : bigint;
                transactionIndex: (
                  blockTag extends 'pending' ? true : false
                ) extends true
                  ? null
                  : number;
              }
            | {
                yParity: number;
                from: `0x${string}`;
                gas: bigint;
                hash: `0x${string}`;
                input: `0x${string}`;
                nonce: number;
                r: `0x${string}`;
                s: `0x${string}`;
                to: `0x${string}` | null;
                typeHex: `0x${string}` | null;
                v: bigint;
                value: bigint;
                accessList: import('viem').AccessList;
                authorizationList?: undefined;
                blobVersionedHashes?: undefined;
                chainId: number;
                type: 'eip2930';
                gasPrice: bigint;
                maxFeePerBlobGas?: undefined;
                maxFeePerGas?: undefined;
                maxPriorityFeePerGas?: undefined;
                blockHash: (
                  blockTag extends 'pending' ? true : false
                ) extends true
                  ? null
                  : `0x${string}`;
                blockNumber: (
                  blockTag extends 'pending' ? true : false
                ) extends true
                  ? null
                  : bigint;
                transactionIndex: (
                  blockTag extends 'pending' ? true : false
                ) extends true
                  ? null
                  : number;
              }
            | {
                yParity: number;
                from: `0x${string}`;
                gas: bigint;
                hash: `0x${string}`;
                input: `0x${string}`;
                nonce: number;
                r: `0x${string}`;
                s: `0x${string}`;
                to: `0x${string}` | null;
                typeHex: `0x${string}` | null;
                v: bigint;
                value: bigint;
                accessList: import('viem').AccessList;
                authorizationList?: undefined;
                blobVersionedHashes?: undefined;
                chainId: number;
                type: 'eip1559';
                gasPrice?: undefined;
                maxFeePerBlobGas?: undefined;
                maxFeePerGas: bigint;
                maxPriorityFeePerGas: bigint;
                blockHash: (
                  blockTag extends 'pending' ? true : false
                ) extends true
                  ? null
                  : `0x${string}`;
                blockNumber: (
                  blockTag extends 'pending' ? true : false
                ) extends true
                  ? null
                  : bigint;
                transactionIndex: (
                  blockTag extends 'pending' ? true : false
                ) extends true
                  ? null
                  : number;
              }
            | {
                yParity: number;
                from: `0x${string}`;
                gas: bigint;
                hash: `0x${string}`;
                input: `0x${string}`;
                nonce: number;
                r: `0x${string}`;
                s: `0x${string}`;
                to: `0x${string}` | null;
                typeHex: `0x${string}` | null;
                v: bigint;
                value: bigint;
                accessList: import('viem').AccessList;
                authorizationList?: undefined;
                blobVersionedHashes: readonly `0x${string}`[];
                chainId: number;
                type: 'eip4844';
                gasPrice?: undefined;
                maxFeePerBlobGas: bigint;
                maxFeePerGas: bigint;
                maxPriorityFeePerGas: bigint;
                blockHash: (
                  blockTag extends 'pending' ? true : false
                ) extends true
                  ? null
                  : `0x${string}`;
                blockNumber: (
                  blockTag extends 'pending' ? true : false
                ) extends true
                  ? null
                  : bigint;
                transactionIndex: (
                  blockTag extends 'pending' ? true : false
                ) extends true
                  ? null
                  : number;
              }
            | {
                yParity: number;
                from: `0x${string}`;
                gas: bigint;
                hash: `0x${string}`;
                input: `0x${string}`;
                nonce: number;
                r: `0x${string}`;
                s: `0x${string}`;
                to: `0x${string}` | null;
                typeHex: `0x${string}` | null;
                v: bigint;
                value: bigint;
                accessList: import('viem').AccessList;
                authorizationList: import('viem/experimental').SignedAuthorizationList;
                blobVersionedHashes?: undefined;
                chainId: number;
                type: 'eip7702';
                gasPrice?: undefined;
                maxFeePerBlobGas?: undefined;
                maxFeePerGas: bigint;
                maxPriorityFeePerGas: bigint;
                blockHash: (
                  blockTag extends 'pending' ? true : false
                ) extends true
                  ? null
                  : `0x${string}`;
                blockNumber: (
                  blockTag extends 'pending' ? true : false
                ) extends true
                  ? null
                  : bigint;
                transactionIndex: (
                  blockTag extends 'pending' ? true : false
                ) extends true
                  ? null
                  : number;
              }
          )[]
        : `0x${string}`[];
    }>;
    getBlockNumber: (
      args?: import('viem').GetBlockNumberParameters | undefined,
    ) => Promise<bigint>;
    getBlockTransactionCount: (
      args?: import('viem').GetBlockTransactionCountParameters | undefined,
    ) => Promise<number>;
    getBytecode: (
      args: import('viem').GetBytecodeParameters,
    ) => Promise<import('viem').GetBytecodeReturnType>;
    getChainId: () => Promise<number>;
    getCode: (
      args: import('viem').GetBytecodeParameters,
    ) => Promise<import('viem').GetBytecodeReturnType>;
    getContractEvents: <
      const abi extends Abi | readonly unknown[],
      eventName extends
        | import('viem').ContractEventName<abi>
        | undefined = undefined,
      strict extends boolean | undefined = undefined,
      fromBlock extends
        | bigint
        | import('viem').BlockTag
        | undefined = undefined,
      toBlock extends bigint | import('viem').BlockTag | undefined = undefined,
    >(
      args: import('viem').GetContractEventsParameters<
        abi,
        eventName,
        strict,
        fromBlock,
        toBlock
      >,
    ) => Promise<
      import('viem').GetContractEventsReturnType<
        abi,
        eventName,
        strict,
        fromBlock,
        toBlock
      >
    >;
    getEip712Domain: (
      args: import('viem').GetEip712DomainParameters,
    ) => Promise<import('viem').GetEip712DomainReturnType>;
    getEnsAddress: (args: {
      blockNumber?: bigint | undefined;
      blockTag?: import('viem').BlockTag | undefined;
      coinType?: number | undefined;
      gatewayUrls?: string[] | undefined;
      name: string;
      strict?: boolean | undefined;
      universalResolverAddress?: `0x${string}` | undefined;
    }) => Promise<import('viem').GetEnsAddressReturnType>;
    getEnsAvatar: (args: {
      name: string;
      blockNumber?: bigint | undefined;
      blockTag?: import('viem').BlockTag | undefined;
      gatewayUrls?: string[] | undefined;
      strict?: boolean | undefined;
      universalResolverAddress?: `0x${string}` | undefined;
      assetGatewayUrls?: import('viem').AssetGatewayUrls | undefined;
    }) => Promise<import('viem').GetEnsAvatarReturnType>;
    getEnsName: (args: {
      blockNumber?: bigint | undefined;
      blockTag?: import('viem').BlockTag | undefined;
      address: `0x${string}`;
      gatewayUrls?: string[] | undefined;
      strict?: boolean | undefined;
      universalResolverAddress?: `0x${string}` | undefined;
    }) => Promise<import('viem').GetEnsNameReturnType>;
    getEnsResolver: (args: {
      blockNumber?: bigint | undefined;
      blockTag?: import('viem').BlockTag | undefined;
      name: string;
      universalResolverAddress?: `0x${string}` | undefined;
    }) => Promise<`0x${string}`>;
    getEnsText: (args: {
      blockNumber?: bigint | undefined;
      blockTag?: import('viem').BlockTag | undefined;
      name: string;
      gatewayUrls?: string[] | undefined;
      key: string;
      strict?: boolean | undefined;
      universalResolverAddress?: `0x${string}` | undefined;
    }) => Promise<import('viem').GetEnsTextReturnType>;
    getFeeHistory: (
      args: import('viem').GetFeeHistoryParameters,
    ) => Promise<import('viem').GetFeeHistoryReturnType>;
    estimateFeesPerGas: <
      chainOverride extends import('viem').Chain | undefined = undefined,
      type extends import('viem').FeeValuesType = 'eip1559',
    >(
      args?:
        | import('viem').EstimateFeesPerGasParameters<
            {
              blockExplorers: {
                readonly default: {
                  readonly name: 'Arbiscan';
                  readonly url: 'https://arbiscan.io';
                  readonly apiUrl: 'https://api.arbiscan.io/api';
                };
              };
              contracts: {
                readonly multicall3: {
                  readonly address: '0xca11bde05977b3631167028862be2a173976ca11';
                  readonly blockCreated: 7654707;
                };
              };
              id: 42161;
              name: 'Arbitrum One';
              nativeCurrency: {
                readonly name: 'Ether';
                readonly symbol: 'ETH';
                readonly decimals: 18;
              };
              rpcUrls: {
                readonly default: {
                  readonly http: readonly ['https://arb1.arbitrum.io/rpc'];
                };
              };
              sourceId?: number | undefined;
              testnet?: boolean | undefined;
              custom?: Record<string, unknown> | undefined;
              fees?: import('viem').ChainFees<undefined> | undefined;
              formatters?: undefined;
              serializers?:
                | import('viem').ChainSerializers<
                    undefined,
                    import('viem').TransactionSerializable<bigint, number>
                  >
                | undefined;
            },
            chainOverride,
            type
          >
        | undefined,
    ) => Promise<import('viem').EstimateFeesPerGasReturnType<type>>;
    getFilterChanges: <
      filterType extends import('viem').FilterType,
      const abi extends Abi | readonly unknown[] | undefined,
      eventName extends string | undefined,
      strict extends boolean | undefined = undefined,
      fromBlock extends
        | bigint
        | import('viem').BlockTag
        | undefined = undefined,
      toBlock extends bigint | import('viem').BlockTag | undefined = undefined,
    >(
      args: import('viem').GetFilterChangesParameters<
        filterType,
        abi,
        eventName,
        strict,
        fromBlock,
        toBlock
      >,
    ) => Promise<
      import('viem').GetFilterChangesReturnType<
        filterType,
        abi,
        eventName,
        strict,
        fromBlock,
        toBlock
      >
    >;
    getFilterLogs: <
      const abi extends Abi | readonly unknown[] | undefined,
      eventName extends string | undefined,
      strict extends boolean | undefined = undefined,
      fromBlock extends
        | bigint
        | import('viem').BlockTag
        | undefined = undefined,
      toBlock extends bigint | import('viem').BlockTag | undefined = undefined,
    >(
      args: import('viem').GetFilterLogsParameters<
        abi,
        eventName,
        strict,
        fromBlock,
        toBlock
      >,
    ) => Promise<
      import('viem').GetFilterLogsReturnType<
        abi,
        eventName,
        strict,
        fromBlock,
        toBlock
      >
    >;
    getGasPrice: () => Promise<bigint>;
    getLogs: <
      const abiEvent extends import('viem').AbiEvent | undefined = undefined,
      const abiEvents extends
        | readonly unknown[]
        | readonly import('viem').AbiEvent[]
        | undefined = abiEvent extends import('viem').AbiEvent
        ? [abiEvent]
        : undefined,
      strict extends boolean | undefined = undefined,
      fromBlock extends
        | bigint
        | import('viem').BlockTag
        | undefined = undefined,
      toBlock extends bigint | import('viem').BlockTag | undefined = undefined,
    >(
      args?:
        | import('viem').GetLogsParameters<
            abiEvent,
            abiEvents,
            strict,
            fromBlock,
            toBlock
          >
        | undefined,
    ) => Promise<
      import('viem').GetLogsReturnType<
        abiEvent,
        abiEvents,
        strict,
        fromBlock,
        toBlock
      >
    >;
    getProof: (
      args: import('viem').GetProofParameters,
    ) => Promise<import('viem').GetProofReturnType>;
    estimateMaxPriorityFeePerGas: <
      chainOverride extends import('viem').Chain | undefined = undefined,
    >(
      args?: {chain?: chainOverride | null | undefined} | undefined,
    ) => Promise<bigint>;
    getStorageAt: (
      args: import('viem').GetStorageAtParameters,
    ) => Promise<import('viem').GetStorageAtReturnType>;
    getTransaction: <blockTag extends import('viem').BlockTag = 'latest'>(
      args: import('viem').GetTransactionParameters<blockTag>,
    ) => Promise<
      | {
          yParity?: undefined;
          from: `0x${string}`;
          gas: bigint;
          hash: `0x${string}`;
          input: `0x${string}`;
          nonce: number;
          r: `0x${string}`;
          s: `0x${string}`;
          to: `0x${string}` | null;
          typeHex: `0x${string}` | null;
          v: bigint;
          value: bigint;
          accessList?: undefined;
          authorizationList?: undefined;
          blobVersionedHashes?: undefined;
          chainId?: number | undefined;
          type: 'legacy';
          gasPrice: bigint;
          maxFeePerBlobGas?: undefined;
          maxFeePerGas?: undefined;
          maxPriorityFeePerGas?: undefined;
          blockHash: (blockTag extends 'pending' ? true : false) extends true
            ? null
            : `0x${string}`;
          blockNumber: (blockTag extends 'pending' ? true : false) extends true
            ? null
            : bigint;
          transactionIndex: (
            blockTag extends 'pending' ? true : false
          ) extends true
            ? null
            : number;
        }
      | {
          yParity: number;
          from: `0x${string}`;
          gas: bigint;
          hash: `0x${string}`;
          input: `0x${string}`;
          nonce: number;
          r: `0x${string}`;
          s: `0x${string}`;
          to: `0x${string}` | null;
          typeHex: `0x${string}` | null;
          v: bigint;
          value: bigint;
          accessList: import('viem').AccessList;
          authorizationList?: undefined;
          blobVersionedHashes?: undefined;
          chainId: number;
          type: 'eip2930';
          gasPrice: bigint;
          maxFeePerBlobGas?: undefined;
          maxFeePerGas?: undefined;
          maxPriorityFeePerGas?: undefined;
          blockHash: (blockTag extends 'pending' ? true : false) extends true
            ? null
            : `0x${string}`;
          blockNumber: (blockTag extends 'pending' ? true : false) extends true
            ? null
            : bigint;
          transactionIndex: (
            blockTag extends 'pending' ? true : false
          ) extends true
            ? null
            : number;
        }
      | {
          yParity: number;
          from: `0x${string}`;
          gas: bigint;
          hash: `0x${string}`;
          input: `0x${string}`;
          nonce: number;
          r: `0x${string}`;
          s: `0x${string}`;
          to: `0x${string}` | null;
          typeHex: `0x${string}` | null;
          v: bigint;
          value: bigint;
          accessList: import('viem').AccessList;
          authorizationList?: undefined;
          blobVersionedHashes?: undefined;
          chainId: number;
          type: 'eip1559';
          gasPrice?: undefined;
          maxFeePerBlobGas?: undefined;
          maxFeePerGas: bigint;
          maxPriorityFeePerGas: bigint;
          blockHash: (blockTag extends 'pending' ? true : false) extends true
            ? null
            : `0x${string}`;
          blockNumber: (blockTag extends 'pending' ? true : false) extends true
            ? null
            : bigint;
          transactionIndex: (
            blockTag extends 'pending' ? true : false
          ) extends true
            ? null
            : number;
        }
      | {
          yParity: number;
          from: `0x${string}`;
          gas: bigint;
          hash: `0x${string}`;
          input: `0x${string}`;
          nonce: number;
          r: `0x${string}`;
          s: `0x${string}`;
          to: `0x${string}` | null;
          typeHex: `0x${string}` | null;
          v: bigint;
          value: bigint;
          accessList: import('viem').AccessList;
          authorizationList?: undefined;
          blobVersionedHashes: readonly `0x${string}`[];
          chainId: number;
          type: 'eip4844';
          gasPrice?: undefined;
          maxFeePerBlobGas: bigint;
          maxFeePerGas: bigint;
          maxPriorityFeePerGas: bigint;
          blockHash: (blockTag extends 'pending' ? true : false) extends true
            ? null
            : `0x${string}`;
          blockNumber: (blockTag extends 'pending' ? true : false) extends true
            ? null
            : bigint;
          transactionIndex: (
            blockTag extends 'pending' ? true : false
          ) extends true
            ? null
            : number;
        }
      | {
          yParity: number;
          from: `0x${string}`;
          gas: bigint;
          hash: `0x${string}`;
          input: `0x${string}`;
          nonce: number;
          r: `0x${string}`;
          s: `0x${string}`;
          to: `0x${string}` | null;
          typeHex: `0x${string}` | null;
          v: bigint;
          value: bigint;
          accessList: import('viem').AccessList;
          authorizationList: import('viem/experimental').SignedAuthorizationList;
          blobVersionedHashes?: undefined;
          chainId: number;
          type: 'eip7702';
          gasPrice?: undefined;
          maxFeePerBlobGas?: undefined;
          maxFeePerGas: bigint;
          maxPriorityFeePerGas: bigint;
          blockHash: (blockTag extends 'pending' ? true : false) extends true
            ? null
            : `0x${string}`;
          blockNumber: (blockTag extends 'pending' ? true : false) extends true
            ? null
            : bigint;
          transactionIndex: (
            blockTag extends 'pending' ? true : false
          ) extends true
            ? null
            : number;
        }
    >;
    getTransactionConfirmations: (
      args: import('viem').GetTransactionConfirmationsParameters<{
        blockExplorers: {
          readonly default: {
            readonly name: 'Arbiscan';
            readonly url: 'https://arbiscan.io';
            readonly apiUrl: 'https://api.arbiscan.io/api';
          };
        };
        contracts: {
          readonly multicall3: {
            readonly address: '0xca11bde05977b3631167028862be2a173976ca11';
            readonly blockCreated: 7654707;
          };
        };
        id: 42161;
        name: 'Arbitrum One';
        nativeCurrency: {
          readonly name: 'Ether';
          readonly symbol: 'ETH';
          readonly decimals: 18;
        };
        rpcUrls: {
          readonly default: {
            readonly http: readonly ['https://arb1.arbitrum.io/rpc'];
          };
        };
        sourceId?: number | undefined;
        testnet?: boolean | undefined;
        custom?: Record<string, unknown> | undefined;
        fees?: import('viem').ChainFees<undefined> | undefined;
        formatters?: undefined;
        serializers?:
          | import('viem').ChainSerializers<
              undefined,
              import('viem').TransactionSerializable<bigint, number>
            >
          | undefined;
      }>,
    ) => Promise<bigint>;
    getTransactionCount: (
      args: import('viem').GetTransactionCountParameters,
    ) => Promise<number>;
    getTransactionReceipt: (
      args: import('viem').GetTransactionReceiptParameters,
    ) => Promise<import('viem').TransactionReceipt>;
    multicall: <
      const contracts extends readonly unknown[],
      allowFailure extends boolean = true,
    >(
      args: import('viem').MulticallParameters<contracts, allowFailure>,
    ) => Promise<import('viem').MulticallReturnType<contracts, allowFailure>>;
    prepareTransactionRequest: <
      const request extends import('viem').PrepareTransactionRequestRequest<
        {
          blockExplorers: {
            readonly default: {
              readonly name: 'Arbiscan';
              readonly url: 'https://arbiscan.io';
              readonly apiUrl: 'https://api.arbiscan.io/api';
            };
          };
          contracts: {
            readonly multicall3: {
              readonly address: '0xca11bde05977b3631167028862be2a173976ca11';
              readonly blockCreated: 7654707;
            };
          };
          id: 42161;
          name: 'Arbitrum One';
          nativeCurrency: {
            readonly name: 'Ether';
            readonly symbol: 'ETH';
            readonly decimals: 18;
          };
          rpcUrls: {
            readonly default: {
              readonly http: readonly ['https://arb1.arbitrum.io/rpc'];
            };
          };
          sourceId?: number | undefined;
          testnet?: boolean | undefined;
          custom?: Record<string, unknown> | undefined;
          fees?: import('viem').ChainFees<undefined> | undefined;
          formatters?: undefined;
          serializers?:
            | import('viem').ChainSerializers<
                undefined,
                import('viem').TransactionSerializable<bigint, number>
              >
            | undefined;
        },
        chainOverride
      >,
      chainOverride extends import('viem').Chain | undefined = undefined,
      accountOverride extends
        | `0x${string}`
        | import('viem').Account
        | undefined = undefined,
    >(
      args: import('viem').PrepareTransactionRequestParameters<
        {
          blockExplorers: {
            readonly default: {
              readonly name: 'Arbiscan';
              readonly url: 'https://arbiscan.io';
              readonly apiUrl: 'https://api.arbiscan.io/api';
            };
          };
          contracts: {
            readonly multicall3: {
              readonly address: '0xca11bde05977b3631167028862be2a173976ca11';
              readonly blockCreated: 7654707;
            };
          };
          id: 42161;
          name: 'Arbitrum One';
          nativeCurrency: {
            readonly name: 'Ether';
            readonly symbol: 'ETH';
            readonly decimals: 18;
          };
          rpcUrls: {
            readonly default: {
              readonly http: readonly ['https://arb1.arbitrum.io/rpc'];
            };
          };
          sourceId?: number | undefined;
          testnet?: boolean | undefined;
          custom?: Record<string, unknown> | undefined;
          fees?: import('viem').ChainFees<undefined> | undefined;
          formatters?: undefined;
          serializers?:
            | import('viem').ChainSerializers<
                undefined,
                import('viem').TransactionSerializable<bigint, number>
              >
            | undefined;
        },
        import('viem').Account | undefined,
        chainOverride,
        accountOverride,
        request
      >,
    ) => Promise<{
      [K in keyof (import('viem').UnionRequiredBy<
        Extract<
          import('viem').UnionOmit<
            import('viem').ExtractChainFormatterParameters<
              import('viem').DeriveChain<
                {
                  blockExplorers: {
                    readonly default: {
                      readonly name: 'Arbiscan';
                      readonly url: 'https://arbiscan.io';
                      readonly apiUrl: 'https://api.arbiscan.io/api';
                    };
                  };
                  contracts: {
                    readonly multicall3: {
                      readonly address: '0xca11bde05977b3631167028862be2a173976ca11';
                      readonly blockCreated: 7654707;
                    };
                  };
                  id: 42161;
                  name: 'Arbitrum One';
                  nativeCurrency: {
                    readonly name: 'Ether';
                    readonly symbol: 'ETH';
                    readonly decimals: 18;
                  };
                  rpcUrls: {
                    readonly default: {
                      readonly http: readonly ['https://arb1.arbitrum.io/rpc'];
                    };
                  };
                  sourceId?: number | undefined;
                  testnet?: boolean | undefined;
                  custom?: Record<string, unknown> | undefined;
                  fees?: import('viem').ChainFees<undefined> | undefined;
                  formatters?: undefined;
                  serializers?:
                    | import('viem').ChainSerializers<
                        undefined,
                        import('viem').TransactionSerializable<bigint, number>
                      >
                    | undefined;
                },
                chainOverride
              >,
              'transactionRequest',
              import('viem').TransactionRequest
            >,
            'from'
          > &
            (import('viem').DeriveChain<
              {
                blockExplorers: {
                  readonly default: {
                    readonly name: 'Arbiscan';
                    readonly url: 'https://arbiscan.io';
                    readonly apiUrl: 'https://api.arbiscan.io/api';
                  };
                };
                contracts: {
                  readonly multicall3: {
                    readonly address: '0xca11bde05977b3631167028862be2a173976ca11';
                    readonly blockCreated: 7654707;
                  };
                };
                id: 42161;
                name: 'Arbitrum One';
                nativeCurrency: {
                  readonly name: 'Ether';
                  readonly symbol: 'ETH';
                  readonly decimals: 18;
                };
                rpcUrls: {
                  readonly default: {
                    readonly http: readonly ['https://arb1.arbitrum.io/rpc'];
                  };
                };
                sourceId?: number | undefined;
                testnet?: boolean | undefined;
                custom?: Record<string, unknown> | undefined;
                fees?: import('viem').ChainFees<undefined> | undefined;
                formatters?: undefined;
                serializers?:
                  | import('viem').ChainSerializers<
                      undefined,
                      import('viem').TransactionSerializable<bigint, number>
                    >
                  | undefined;
              },
              chainOverride
            > extends import('viem').Chain
              ? {
                  chain: import('viem').DeriveChain<
                    {
                      blockExplorers: {
                        readonly default: {
                          readonly name: 'Arbiscan';
                          readonly url: 'https://arbiscan.io';
                          readonly apiUrl: 'https://api.arbiscan.io/api';
                        };
                      };
                      contracts: {
                        readonly multicall3: {
                          readonly address: '0xca11bde05977b3631167028862be2a173976ca11';
                          readonly blockCreated: 7654707;
                        };
                      };
                      id: 42161;
                      name: 'Arbitrum One';
                      nativeCurrency: {
                        readonly name: 'Ether';
                        readonly symbol: 'ETH';
                        readonly decimals: 18;
                      };
                      rpcUrls: {
                        readonly default: {
                          readonly http: readonly [
                            'https://arb1.arbitrum.io/rpc',
                          ];
                        };
                      };
                      sourceId?: number | undefined;
                      testnet?: boolean | undefined;
                      custom?: Record<string, unknown> | undefined;
                      fees?: import('viem').ChainFees<undefined> | undefined;
                      formatters?: undefined;
                      serializers?:
                        | import('viem').ChainSerializers<
                            undefined,
                            import('viem').TransactionSerializable<
                              bigint,
                              number
                            >
                          >
                        | undefined;
                    },
                    chainOverride
                  >;
                }
              : {chain?: undefined}) &
            (import('viem').DeriveAccount<
              import('viem').Account | undefined,
              accountOverride
            > extends import('viem').Account
              ? {
                  account: import('viem').Account &
                    import('viem').DeriveAccount<
                      import('viem').Account | undefined,
                      accountOverride
                    >;
                  from: `0x${string}`;
                }
              : {account?: undefined; from?: undefined}),
          import('viem').IsNever<
            | ((
                request['type'] extends string | undefined
                  ? request['type']
                  : import('viem').GetTransactionType<
                        request,
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').FeeValuesLegacy)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableLegacy
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | keyof import('viem').FeeValuesLegacy<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'legacy'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestLegacy
                                : never)
                            ? 'legacy'
                            : never)
                        | (request extends
                            | ({
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: undefined;
                                maxFeePerBlobGas?: undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?: undefined;
                              } & (import('viem').OneOf<
                                | {maxFeePerGas: bigint}
                                | {maxPriorityFeePerGas: bigint},
                                import('viem').FeeValuesEIP1559
                              > & {
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                              }))
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP1559
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | keyof import('viem').FeeValuesEIP1559<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip1559'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP1559
                                : never)
                            ? 'eip1559'
                            : never)
                        | (request extends
                            | ({
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').ExactPartial<
                                import('viem').FeeValuesLegacy
                              > & {
                                  accessList:
                                    | import('viem').AccessList
                                    | undefined;
                                })
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP2930
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | keyof import('viem').FeeValuesLegacy<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip2930'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP2930
                                : never)
                            ? 'eip2930'
                            : never)
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?: undefined;
                                blobs?:
                                  | readonly `0x${string}`[]
                                  | readonly Uint8Array[]
                                  | undefined;
                                blobVersionedHashes?:
                                  | readonly `0x${string}`[]
                                  | undefined;
                                maxFeePerBlobGas?: bigint | undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?:
                                  | false
                                  | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                  | undefined;
                              } & (import('viem').ExactPartial<
                                import('viem').FeeValuesEIP4844
                              > &
                                import('viem').OneOf<
                                  | {
                                      blobs:
                                        | readonly `0x${string}`[]
                                        | readonly Uint8Array[]
                                        | undefined;
                                    }
                                  | {
                                      blobVersionedHashes:
                                        | readonly `0x${string}`[]
                                        | undefined;
                                    }
                                  | {
                                      sidecars:
                                        | false
                                        | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                        | undefined;
                                    },
                                  import('viem').TransactionSerializableEIP4844
                                >))
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'blobVersionedHashes'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    | 'blobs'
                                    | 'kzg'
                                    | 'sidecars'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP4844
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'from'
                                    | 'gas'
                                    | 'nonce'
                                    | 'to'
                                    | 'value'
                                    | 'accessList'
                                    | 'blobVersionedHashes'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    | 'blobs'
                                    | 'kzg'
                                    | 'sidecars'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP4844
                                : never)
                            ? 'eip4844'
                            : never)
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?:
                                  | import('viem/experimental').SignedAuthorizationList
                                  | undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').ExactPartial<
                                import('viem').FeeValuesEIP1559
                              > & {
                                  authorizationList: import('viem/experimental').SignedAuthorizationList;
                                })
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'authorizationList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP7702
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | 'authorizationList'
                                    | keyof import('viem').FeeValuesEIP1559<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip7702'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP7702
                                : never)
                            ? 'eip7702'
                            : never)
                        | (request['type'] extends string | undefined
                            ? Extract<request['type'], string>
                            : never)
                      > extends 'legacy'
                    ? unknown
                    : import('viem').GetTransactionType<
                        request,
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').FeeValuesLegacy)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableLegacy
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | keyof import('viem').FeeValuesLegacy<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'legacy'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestLegacy
                                : never)
                            ? 'legacy'
                            : never)
                        | (request extends
                            | ({
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: undefined;
                                maxFeePerBlobGas?: undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?: undefined;
                              } & (import('viem').OneOf<
                                | {maxFeePerGas: bigint}
                                | {maxPriorityFeePerGas: bigint},
                                import('viem').FeeValuesEIP1559
                              > & {
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                              }))
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP1559
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | keyof import('viem').FeeValuesEIP1559<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip1559'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP1559
                                : never)
                            ? 'eip1559'
                            : never)
                        | (request extends
                            | ({
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').ExactPartial<
                                import('viem').FeeValuesLegacy
                              > & {
                                  accessList:
                                    | import('viem').AccessList
                                    | undefined;
                                })
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP2930
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | keyof import('viem').FeeValuesLegacy<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip2930'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP2930
                                : never)
                            ? 'eip2930'
                            : never)
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?: undefined;
                                blobs?:
                                  | readonly `0x${string}`[]
                                  | readonly Uint8Array[]
                                  | undefined;
                                blobVersionedHashes?:
                                  | readonly `0x${string}`[]
                                  | undefined;
                                maxFeePerBlobGas?: bigint | undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?:
                                  | false
                                  | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                  | undefined;
                              } & (import('viem').ExactPartial<
                                import('viem').FeeValuesEIP4844
                              > &
                                import('viem').OneOf<
                                  | {
                                      blobs:
                                        | readonly `0x${string}`[]
                                        | readonly Uint8Array[]
                                        | undefined;
                                    }
                                  | {
                                      blobVersionedHashes:
                                        | readonly `0x${string}`[]
                                        | undefined;
                                    }
                                  | {
                                      sidecars:
                                        | false
                                        | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                        | undefined;
                                    },
                                  import('viem').TransactionSerializableEIP4844
                                >))
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'blobVersionedHashes'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    | 'blobs'
                                    | 'kzg'
                                    | 'sidecars'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP4844
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'from'
                                    | 'gas'
                                    | 'nonce'
                                    | 'to'
                                    | 'value'
                                    | 'accessList'
                                    | 'blobVersionedHashes'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    | 'blobs'
                                    | 'kzg'
                                    | 'sidecars'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP4844
                                : never)
                            ? 'eip4844'
                            : never)
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?:
                                  | import('viem/experimental').SignedAuthorizationList
                                  | undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').ExactPartial<
                                import('viem').FeeValuesEIP1559
                              > & {
                                  authorizationList: import('viem/experimental').SignedAuthorizationList;
                                })
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'authorizationList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP7702
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | 'authorizationList'
                                    | keyof import('viem').FeeValuesEIP1559<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip7702'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP7702
                                : never)
                            ? 'eip7702'
                            : never)
                        | (request['type'] extends string | undefined
                            ? Extract<request['type'], string>
                            : never)
                      >
              ) extends 'legacy'
                ? import('viem').TransactionRequestLegacy
                : never)
            | ((
                request['type'] extends string | undefined
                  ? request['type']
                  : import('viem').GetTransactionType<
                        request,
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').FeeValuesLegacy)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableLegacy
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | keyof import('viem').FeeValuesLegacy<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'legacy'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestLegacy
                                : never)
                            ? 'legacy'
                            : never)
                        | (request extends
                            | ({
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: undefined;
                                maxFeePerBlobGas?: undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?: undefined;
                              } & (import('viem').OneOf<
                                | {maxFeePerGas: bigint}
                                | {maxPriorityFeePerGas: bigint},
                                import('viem').FeeValuesEIP1559
                              > & {
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                              }))
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP1559
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | keyof import('viem').FeeValuesEIP1559<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip1559'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP1559
                                : never)
                            ? 'eip1559'
                            : never)
                        | (request extends
                            | ({
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').ExactPartial<
                                import('viem').FeeValuesLegacy
                              > & {
                                  accessList:
                                    | import('viem').AccessList
                                    | undefined;
                                })
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP2930
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | keyof import('viem').FeeValuesLegacy<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip2930'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP2930
                                : never)
                            ? 'eip2930'
                            : never)
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?: undefined;
                                blobs?:
                                  | readonly `0x${string}`[]
                                  | readonly Uint8Array[]
                                  | undefined;
                                blobVersionedHashes?:
                                  | readonly `0x${string}`[]
                                  | undefined;
                                maxFeePerBlobGas?: bigint | undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?:
                                  | false
                                  | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                  | undefined;
                              } & (import('viem').ExactPartial<
                                import('viem').FeeValuesEIP4844
                              > &
                                import('viem').OneOf<
                                  | {
                                      blobs:
                                        | readonly `0x${string}`[]
                                        | readonly Uint8Array[]
                                        | undefined;
                                    }
                                  | {
                                      blobVersionedHashes:
                                        | readonly `0x${string}`[]
                                        | undefined;
                                    }
                                  | {
                                      sidecars:
                                        | false
                                        | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                        | undefined;
                                    },
                                  import('viem').TransactionSerializableEIP4844
                                >))
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'blobVersionedHashes'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    | 'blobs'
                                    | 'kzg'
                                    | 'sidecars'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP4844
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'from'
                                    | 'gas'
                                    | 'nonce'
                                    | 'to'
                                    | 'value'
                                    | 'accessList'
                                    | 'blobVersionedHashes'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    | 'blobs'
                                    | 'kzg'
                                    | 'sidecars'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP4844
                                : never)
                            ? 'eip4844'
                            : never)
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?:
                                  | import('viem/experimental').SignedAuthorizationList
                                  | undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').ExactPartial<
                                import('viem').FeeValuesEIP1559
                              > & {
                                  authorizationList: import('viem/experimental').SignedAuthorizationList;
                                })
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'authorizationList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP7702
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | 'authorizationList'
                                    | keyof import('viem').FeeValuesEIP1559<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip7702'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP7702
                                : never)
                            ? 'eip7702'
                            : never)
                        | (request['type'] extends string | undefined
                            ? Extract<request['type'], string>
                            : never)
                      > extends 'legacy'
                    ? unknown
                    : import('viem').GetTransactionType<
                        request,
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').FeeValuesLegacy)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableLegacy
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | keyof import('viem').FeeValuesLegacy<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'legacy'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestLegacy
                                : never)
                            ? 'legacy'
                            : never)
                        | (request extends
                            | ({
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: undefined;
                                maxFeePerBlobGas?: undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?: undefined;
                              } & (import('viem').OneOf<
                                | {maxFeePerGas: bigint}
                                | {maxPriorityFeePerGas: bigint},
                                import('viem').FeeValuesEIP1559
                              > & {
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                              }))
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP1559
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | keyof import('viem').FeeValuesEIP1559<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip1559'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP1559
                                : never)
                            ? 'eip1559'
                            : never)
                        | (request extends
                            | ({
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').ExactPartial<
                                import('viem').FeeValuesLegacy
                              > & {
                                  accessList:
                                    | import('viem').AccessList
                                    | undefined;
                                })
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP2930
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | keyof import('viem').FeeValuesLegacy<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip2930'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP2930
                                : never)
                            ? 'eip2930'
                            : never)
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?: undefined;
                                blobs?:
                                  | readonly `0x${string}`[]
                                  | readonly Uint8Array[]
                                  | undefined;
                                blobVersionedHashes?:
                                  | readonly `0x${string}`[]
                                  | undefined;
                                maxFeePerBlobGas?: bigint | undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?:
                                  | false
                                  | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                  | undefined;
                              } & (import('viem').ExactPartial<
                                import('viem').FeeValuesEIP4844
                              > &
                                import('viem').OneOf<
                                  | {
                                      blobs:
                                        | readonly `0x${string}`[]
                                        | readonly Uint8Array[]
                                        | undefined;
                                    }
                                  | {
                                      blobVersionedHashes:
                                        | readonly `0x${string}`[]
                                        | undefined;
                                    }
                                  | {
                                      sidecars:
                                        | false
                                        | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                        | undefined;
                                    },
                                  import('viem').TransactionSerializableEIP4844
                                >))
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'blobVersionedHashes'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    | 'blobs'
                                    | 'kzg'
                                    | 'sidecars'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP4844
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'from'
                                    | 'gas'
                                    | 'nonce'
                                    | 'to'
                                    | 'value'
                                    | 'accessList'
                                    | 'blobVersionedHashes'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    | 'blobs'
                                    | 'kzg'
                                    | 'sidecars'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP4844
                                : never)
                            ? 'eip4844'
                            : never)
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?:
                                  | import('viem/experimental').SignedAuthorizationList
                                  | undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').ExactPartial<
                                import('viem').FeeValuesEIP1559
                              > & {
                                  authorizationList: import('viem/experimental').SignedAuthorizationList;
                                })
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'authorizationList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP7702
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | 'authorizationList'
                                    | keyof import('viem').FeeValuesEIP1559<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip7702'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP7702
                                : never)
                            ? 'eip7702'
                            : never)
                        | (request['type'] extends string | undefined
                            ? Extract<request['type'], string>
                            : never)
                      >
              ) extends 'eip1559'
                ? import('viem').TransactionRequestEIP1559
                : never)
            | ((
                request['type'] extends string | undefined
                  ? request['type']
                  : import('viem').GetTransactionType<
                        request,
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').FeeValuesLegacy)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableLegacy
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | keyof import('viem').FeeValuesLegacy<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'legacy'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestLegacy
                                : never)
                            ? 'legacy'
                            : never)
                        | (request extends
                            | ({
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: undefined;
                                maxFeePerBlobGas?: undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?: undefined;
                              } & (import('viem').OneOf<
                                | {maxFeePerGas: bigint}
                                | {maxPriorityFeePerGas: bigint},
                                import('viem').FeeValuesEIP1559
                              > & {
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                              }))
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP1559
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | keyof import('viem').FeeValuesEIP1559<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip1559'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP1559
                                : never)
                            ? 'eip1559'
                            : never)
                        | (request extends
                            | ({
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').ExactPartial<
                                import('viem').FeeValuesLegacy
                              > & {
                                  accessList:
                                    | import('viem').AccessList
                                    | undefined;
                                })
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP2930
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | keyof import('viem').FeeValuesLegacy<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip2930'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP2930
                                : never)
                            ? 'eip2930'
                            : never)
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?: undefined;
                                blobs?:
                                  | readonly `0x${string}`[]
                                  | readonly Uint8Array[]
                                  | undefined;
                                blobVersionedHashes?:
                                  | readonly `0x${string}`[]
                                  | undefined;
                                maxFeePerBlobGas?: bigint | undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?:
                                  | false
                                  | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                  | undefined;
                              } & (import('viem').ExactPartial<
                                import('viem').FeeValuesEIP4844
                              > &
                                import('viem').OneOf<
                                  | {
                                      blobs:
                                        | readonly `0x${string}`[]
                                        | readonly Uint8Array[]
                                        | undefined;
                                    }
                                  | {
                                      blobVersionedHashes:
                                        | readonly `0x${string}`[]
                                        | undefined;
                                    }
                                  | {
                                      sidecars:
                                        | false
                                        | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                        | undefined;
                                    },
                                  import('viem').TransactionSerializableEIP4844
                                >))
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'blobVersionedHashes'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    | 'blobs'
                                    | 'kzg'
                                    | 'sidecars'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP4844
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'from'
                                    | 'gas'
                                    | 'nonce'
                                    | 'to'
                                    | 'value'
                                    | 'accessList'
                                    | 'blobVersionedHashes'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    | 'blobs'
                                    | 'kzg'
                                    | 'sidecars'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP4844
                                : never)
                            ? 'eip4844'
                            : never)
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?:
                                  | import('viem/experimental').SignedAuthorizationList
                                  | undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').ExactPartial<
                                import('viem').FeeValuesEIP1559
                              > & {
                                  authorizationList: import('viem/experimental').SignedAuthorizationList;
                                })
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'authorizationList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP7702
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | 'authorizationList'
                                    | keyof import('viem').FeeValuesEIP1559<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip7702'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP7702
                                : never)
                            ? 'eip7702'
                            : never)
                        | (request['type'] extends string | undefined
                            ? Extract<request['type'], string>
                            : never)
                      > extends 'legacy'
                    ? unknown
                    : import('viem').GetTransactionType<
                        request,
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').FeeValuesLegacy)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableLegacy
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | keyof import('viem').FeeValuesLegacy<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'legacy'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestLegacy
                                : never)
                            ? 'legacy'
                            : never)
                        | (request extends
                            | ({
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: undefined;
                                maxFeePerBlobGas?: undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?: undefined;
                              } & (import('viem').OneOf<
                                | {maxFeePerGas: bigint}
                                | {maxPriorityFeePerGas: bigint},
                                import('viem').FeeValuesEIP1559
                              > & {
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                              }))
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP1559
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | keyof import('viem').FeeValuesEIP1559<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip1559'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP1559
                                : never)
                            ? 'eip1559'
                            : never)
                        | (request extends
                            | ({
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').ExactPartial<
                                import('viem').FeeValuesLegacy
                              > & {
                                  accessList:
                                    | import('viem').AccessList
                                    | undefined;
                                })
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP2930
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | keyof import('viem').FeeValuesLegacy<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip2930'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP2930
                                : never)
                            ? 'eip2930'
                            : never)
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?: undefined;
                                blobs?:
                                  | readonly `0x${string}`[]
                                  | readonly Uint8Array[]
                                  | undefined;
                                blobVersionedHashes?:
                                  | readonly `0x${string}`[]
                                  | undefined;
                                maxFeePerBlobGas?: bigint | undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?:
                                  | false
                                  | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                  | undefined;
                              } & (import('viem').ExactPartial<
                                import('viem').FeeValuesEIP4844
                              > &
                                import('viem').OneOf<
                                  | {
                                      blobs:
                                        | readonly `0x${string}`[]
                                        | readonly Uint8Array[]
                                        | undefined;
                                    }
                                  | {
                                      blobVersionedHashes:
                                        | readonly `0x${string}`[]
                                        | undefined;
                                    }
                                  | {
                                      sidecars:
                                        | false
                                        | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                        | undefined;
                                    },
                                  import('viem').TransactionSerializableEIP4844
                                >))
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'blobVersionedHashes'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    | 'blobs'
                                    | 'kzg'
                                    | 'sidecars'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP4844
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'from'
                                    | 'gas'
                                    | 'nonce'
                                    | 'to'
                                    | 'value'
                                    | 'accessList'
                                    | 'blobVersionedHashes'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    | 'blobs'
                                    | 'kzg'
                                    | 'sidecars'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP4844
                                : never)
                            ? 'eip4844'
                            : never)
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?:
                                  | import('viem/experimental').SignedAuthorizationList
                                  | undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').ExactPartial<
                                import('viem').FeeValuesEIP1559
                              > & {
                                  authorizationList: import('viem/experimental').SignedAuthorizationList;
                                })
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'authorizationList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP7702
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | 'authorizationList'
                                    | keyof import('viem').FeeValuesEIP1559<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip7702'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP7702
                                : never)
                            ? 'eip7702'
                            : never)
                        | (request['type'] extends string | undefined
                            ? Extract<request['type'], string>
                            : never)
                      >
              ) extends 'eip2930'
                ? import('viem').TransactionRequestEIP2930
                : never)
            | ((
                request['type'] extends string | undefined
                  ? request['type']
                  : import('viem').GetTransactionType<
                        request,
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').FeeValuesLegacy)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableLegacy
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | keyof import('viem').FeeValuesLegacy<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'legacy'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestLegacy
                                : never)
                            ? 'legacy'
                            : never)
                        | (request extends
                            | ({
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: undefined;
                                maxFeePerBlobGas?: undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?: undefined;
                              } & (import('viem').OneOf<
                                | {maxFeePerGas: bigint}
                                | {maxPriorityFeePerGas: bigint},
                                import('viem').FeeValuesEIP1559
                              > & {
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                              }))
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP1559
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | keyof import('viem').FeeValuesEIP1559<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip1559'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP1559
                                : never)
                            ? 'eip1559'
                            : never)
                        | (request extends
                            | ({
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').ExactPartial<
                                import('viem').FeeValuesLegacy
                              > & {
                                  accessList:
                                    | import('viem').AccessList
                                    | undefined;
                                })
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP2930
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | keyof import('viem').FeeValuesLegacy<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip2930'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP2930
                                : never)
                            ? 'eip2930'
                            : never)
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?: undefined;
                                blobs?:
                                  | readonly `0x${string}`[]
                                  | readonly Uint8Array[]
                                  | undefined;
                                blobVersionedHashes?:
                                  | readonly `0x${string}`[]
                                  | undefined;
                                maxFeePerBlobGas?: bigint | undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?:
                                  | false
                                  | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                  | undefined;
                              } & (import('viem').ExactPartial<
                                import('viem').FeeValuesEIP4844
                              > &
                                import('viem').OneOf<
                                  | {
                                      blobs:
                                        | readonly `0x${string}`[]
                                        | readonly Uint8Array[]
                                        | undefined;
                                    }
                                  | {
                                      blobVersionedHashes:
                                        | readonly `0x${string}`[]
                                        | undefined;
                                    }
                                  | {
                                      sidecars:
                                        | false
                                        | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                        | undefined;
                                    },
                                  import('viem').TransactionSerializableEIP4844
                                >))
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'blobVersionedHashes'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    | 'blobs'
                                    | 'kzg'
                                    | 'sidecars'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP4844
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'from'
                                    | 'gas'
                                    | 'nonce'
                                    | 'to'
                                    | 'value'
                                    | 'accessList'
                                    | 'blobVersionedHashes'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    | 'blobs'
                                    | 'kzg'
                                    | 'sidecars'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP4844
                                : never)
                            ? 'eip4844'
                            : never)
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?:
                                  | import('viem/experimental').SignedAuthorizationList
                                  | undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').ExactPartial<
                                import('viem').FeeValuesEIP1559
                              > & {
                                  authorizationList: import('viem/experimental').SignedAuthorizationList;
                                })
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'authorizationList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP7702
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | 'authorizationList'
                                    | keyof import('viem').FeeValuesEIP1559<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip7702'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP7702
                                : never)
                            ? 'eip7702'
                            : never)
                        | (request['type'] extends string | undefined
                            ? Extract<request['type'], string>
                            : never)
                      > extends 'legacy'
                    ? unknown
                    : import('viem').GetTransactionType<
                        request,
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').FeeValuesLegacy)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableLegacy
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | keyof import('viem').FeeValuesLegacy<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'legacy'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestLegacy
                                : never)
                            ? 'legacy'
                            : never)
                        | (request extends
                            | ({
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: undefined;
                                maxFeePerBlobGas?: undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?: undefined;
                              } & (import('viem').OneOf<
                                | {maxFeePerGas: bigint}
                                | {maxPriorityFeePerGas: bigint},
                                import('viem').FeeValuesEIP1559
                              > & {
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                              }))
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP1559
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | keyof import('viem').FeeValuesEIP1559<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip1559'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP1559
                                : never)
                            ? 'eip1559'
                            : never)
                        | (request extends
                            | ({
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').ExactPartial<
                                import('viem').FeeValuesLegacy
                              > & {
                                  accessList:
                                    | import('viem').AccessList
                                    | undefined;
                                })
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP2930
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | keyof import('viem').FeeValuesLegacy<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip2930'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP2930
                                : never)
                            ? 'eip2930'
                            : never)
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?: undefined;
                                blobs?:
                                  | readonly `0x${string}`[]
                                  | readonly Uint8Array[]
                                  | undefined;
                                blobVersionedHashes?:
                                  | readonly `0x${string}`[]
                                  | undefined;
                                maxFeePerBlobGas?: bigint | undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?:
                                  | false
                                  | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                  | undefined;
                              } & (import('viem').ExactPartial<
                                import('viem').FeeValuesEIP4844
                              > &
                                import('viem').OneOf<
                                  | {
                                      blobs:
                                        | readonly `0x${string}`[]
                                        | readonly Uint8Array[]
                                        | undefined;
                                    }
                                  | {
                                      blobVersionedHashes:
                                        | readonly `0x${string}`[]
                                        | undefined;
                                    }
                                  | {
                                      sidecars:
                                        | false
                                        | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                        | undefined;
                                    },
                                  import('viem').TransactionSerializableEIP4844
                                >))
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'blobVersionedHashes'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    | 'blobs'
                                    | 'kzg'
                                    | 'sidecars'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP4844
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'from'
                                    | 'gas'
                                    | 'nonce'
                                    | 'to'
                                    | 'value'
                                    | 'accessList'
                                    | 'blobVersionedHashes'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    | 'blobs'
                                    | 'kzg'
                                    | 'sidecars'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP4844
                                : never)
                            ? 'eip4844'
                            : never)
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?:
                                  | import('viem/experimental').SignedAuthorizationList
                                  | undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').ExactPartial<
                                import('viem').FeeValuesEIP1559
                              > & {
                                  authorizationList: import('viem/experimental').SignedAuthorizationList;
                                })
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'authorizationList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP7702
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | 'authorizationList'
                                    | keyof import('viem').FeeValuesEIP1559<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip7702'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP7702
                                : never)
                            ? 'eip7702'
                            : never)
                        | (request['type'] extends string | undefined
                            ? Extract<request['type'], string>
                            : never)
                      >
              ) extends 'eip4844'
                ? import('viem').TransactionRequestEIP4844
                : never)
            | ((
                request['type'] extends string | undefined
                  ? request['type']
                  : import('viem').GetTransactionType<
                        request,
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').FeeValuesLegacy)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableLegacy
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | keyof import('viem').FeeValuesLegacy<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'legacy'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestLegacy
                                : never)
                            ? 'legacy'
                            : never)
                        | (request extends
                            | ({
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: undefined;
                                maxFeePerBlobGas?: undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?: undefined;
                              } & (import('viem').OneOf<
                                | {maxFeePerGas: bigint}
                                | {maxPriorityFeePerGas: bigint},
                                import('viem').FeeValuesEIP1559
                              > & {
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                              }))
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP1559
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | keyof import('viem').FeeValuesEIP1559<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip1559'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP1559
                                : never)
                            ? 'eip1559'
                            : never)
                        | (request extends
                            | ({
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').ExactPartial<
                                import('viem').FeeValuesLegacy
                              > & {
                                  accessList:
                                    | import('viem').AccessList
                                    | undefined;
                                })
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP2930
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | keyof import('viem').FeeValuesLegacy<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip2930'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP2930
                                : never)
                            ? 'eip2930'
                            : never)
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?: undefined;
                                blobs?:
                                  | readonly `0x${string}`[]
                                  | readonly Uint8Array[]
                                  | undefined;
                                blobVersionedHashes?:
                                  | readonly `0x${string}`[]
                                  | undefined;
                                maxFeePerBlobGas?: bigint | undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?:
                                  | false
                                  | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                  | undefined;
                              } & (import('viem').ExactPartial<
                                import('viem').FeeValuesEIP4844
                              > &
                                import('viem').OneOf<
                                  | {
                                      blobs:
                                        | readonly `0x${string}`[]
                                        | readonly Uint8Array[]
                                        | undefined;
                                    }
                                  | {
                                      blobVersionedHashes:
                                        | readonly `0x${string}`[]
                                        | undefined;
                                    }
                                  | {
                                      sidecars:
                                        | false
                                        | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                        | undefined;
                                    },
                                  import('viem').TransactionSerializableEIP4844
                                >))
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'blobVersionedHashes'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    | 'blobs'
                                    | 'kzg'
                                    | 'sidecars'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP4844
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'from'
                                    | 'gas'
                                    | 'nonce'
                                    | 'to'
                                    | 'value'
                                    | 'accessList'
                                    | 'blobVersionedHashes'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    | 'blobs'
                                    | 'kzg'
                                    | 'sidecars'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP4844
                                : never)
                            ? 'eip4844'
                            : never)
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?:
                                  | import('viem/experimental').SignedAuthorizationList
                                  | undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').ExactPartial<
                                import('viem').FeeValuesEIP1559
                              > & {
                                  authorizationList: import('viem/experimental').SignedAuthorizationList;
                                })
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'authorizationList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP7702
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | 'authorizationList'
                                    | keyof import('viem').FeeValuesEIP1559<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip7702'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP7702
                                : never)
                            ? 'eip7702'
                            : never)
                        | (request['type'] extends string | undefined
                            ? Extract<request['type'], string>
                            : never)
                      > extends 'legacy'
                    ? unknown
                    : import('viem').GetTransactionType<
                        request,
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').FeeValuesLegacy)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableLegacy
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | keyof import('viem').FeeValuesLegacy<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'legacy'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestLegacy
                                : never)
                            ? 'legacy'
                            : never)
                        | (request extends
                            | ({
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: undefined;
                                maxFeePerBlobGas?: undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?: undefined;
                              } & (import('viem').OneOf<
                                | {maxFeePerGas: bigint}
                                | {maxPriorityFeePerGas: bigint},
                                import('viem').FeeValuesEIP1559
                              > & {
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                              }))
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP1559
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | keyof import('viem').FeeValuesEIP1559<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip1559'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP1559
                                : never)
                            ? 'eip1559'
                            : never)
                        | (request extends
                            | ({
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').ExactPartial<
                                import('viem').FeeValuesLegacy
                              > & {
                                  accessList:
                                    | import('viem').AccessList
                                    | undefined;
                                })
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP2930
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | keyof import('viem').FeeValuesLegacy<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip2930'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP2930
                                : never)
                            ? 'eip2930'
                            : never)
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?: undefined;
                                blobs?:
                                  | readonly `0x${string}`[]
                                  | readonly Uint8Array[]
                                  | undefined;
                                blobVersionedHashes?:
                                  | readonly `0x${string}`[]
                                  | undefined;
                                maxFeePerBlobGas?: bigint | undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?:
                                  | false
                                  | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                  | undefined;
                              } & (import('viem').ExactPartial<
                                import('viem').FeeValuesEIP4844
                              > &
                                import('viem').OneOf<
                                  | {
                                      blobs:
                                        | readonly `0x${string}`[]
                                        | readonly Uint8Array[]
                                        | undefined;
                                    }
                                  | {
                                      blobVersionedHashes:
                                        | readonly `0x${string}`[]
                                        | undefined;
                                    }
                                  | {
                                      sidecars:
                                        | false
                                        | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                        | undefined;
                                    },
                                  import('viem').TransactionSerializableEIP4844
                                >))
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'blobVersionedHashes'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    | 'blobs'
                                    | 'kzg'
                                    | 'sidecars'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP4844
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'from'
                                    | 'gas'
                                    | 'nonce'
                                    | 'to'
                                    | 'value'
                                    | 'accessList'
                                    | 'blobVersionedHashes'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    | 'blobs'
                                    | 'kzg'
                                    | 'sidecars'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP4844
                                : never)
                            ? 'eip4844'
                            : never)
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?:
                                  | import('viem/experimental').SignedAuthorizationList
                                  | undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').ExactPartial<
                                import('viem').FeeValuesEIP1559
                              > & {
                                  authorizationList: import('viem/experimental').SignedAuthorizationList;
                                })
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'authorizationList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP7702
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | 'authorizationList'
                                    | keyof import('viem').FeeValuesEIP1559<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip7702'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP7702
                                : never)
                            ? 'eip7702'
                            : never)
                        | (request['type'] extends string | undefined
                            ? Extract<request['type'], string>
                            : never)
                      >
              ) extends 'eip7702'
                ? import('viem').TransactionRequestEIP7702
                : never)
          > extends true
            ? unknown
            : import('viem').ExactPartial<
                | ((
                    request['type'] extends string | undefined
                      ? request['type']
                      : import('viem').GetTransactionType<
                            request,
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').FeeValuesLegacy)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableLegacy
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | keyof import('viem').FeeValuesLegacy<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'legacy'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestLegacy
                                    : never)
                                ? 'legacy'
                                : never)
                            | (request extends
                                | ({
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: undefined;
                                    maxFeePerBlobGas?: undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & (import('viem').OneOf<
                                    | {maxFeePerGas: bigint}
                                    | {maxPriorityFeePerGas: bigint},
                                    import('viem').FeeValuesEIP1559
                                  > & {
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                  }))
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP1559
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | keyof import('viem').FeeValuesEIP1559<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip1559'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP1559
                                    : never)
                                ? 'eip1559'
                                : never)
                            | (request extends
                                | ({
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').ExactPartial<
                                    import('viem').FeeValuesLegacy
                                  > & {
                                      accessList:
                                        | import('viem').AccessList
                                        | undefined;
                                    })
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP2930
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | keyof import('viem').FeeValuesLegacy<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip2930'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP2930
                                    : never)
                                ? 'eip2930'
                                : never)
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?: undefined;
                                    blobs?:
                                      | readonly `0x${string}`[]
                                      | readonly Uint8Array[]
                                      | undefined;
                                    blobVersionedHashes?:
                                      | readonly `0x${string}`[]
                                      | undefined;
                                    maxFeePerBlobGas?: bigint | undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?:
                                      | false
                                      | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                      | undefined;
                                  } & (import('viem').ExactPartial<
                                    import('viem').FeeValuesEIP4844
                                  > &
                                    import('viem').OneOf<
                                      | {
                                          blobs:
                                            | readonly `0x${string}`[]
                                            | readonly Uint8Array[]
                                            | undefined;
                                        }
                                      | {
                                          blobVersionedHashes:
                                            | readonly `0x${string}`[]
                                            | undefined;
                                        }
                                      | {
                                          sidecars:
                                            | false
                                            | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                            | undefined;
                                        },
                                      import('viem').TransactionSerializableEIP4844
                                    >))
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'blobVersionedHashes'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        | 'blobs'
                                        | 'kzg'
                                        | 'sidecars'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP4844
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'from'
                                        | 'gas'
                                        | 'nonce'
                                        | 'to'
                                        | 'value'
                                        | 'accessList'
                                        | 'blobVersionedHashes'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        | 'blobs'
                                        | 'kzg'
                                        | 'sidecars'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP4844
                                    : never)
                                ? 'eip4844'
                                : never)
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?:
                                      | import('viem/experimental').SignedAuthorizationList
                                      | undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').ExactPartial<
                                    import('viem').FeeValuesEIP1559
                                  > & {
                                      authorizationList: import('viem/experimental').SignedAuthorizationList;
                                    })
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'authorizationList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP7702
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | 'authorizationList'
                                        | keyof import('viem').FeeValuesEIP1559<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip7702'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP7702
                                    : never)
                                ? 'eip7702'
                                : never)
                            | (request['type'] extends string | undefined
                                ? Extract<request['type'], string>
                                : never)
                          > extends 'legacy'
                        ? unknown
                        : import('viem').GetTransactionType<
                            request,
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').FeeValuesLegacy)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableLegacy
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | keyof import('viem').FeeValuesLegacy<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'legacy'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestLegacy
                                    : never)
                                ? 'legacy'
                                : never)
                            | (request extends
                                | ({
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: undefined;
                                    maxFeePerBlobGas?: undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & (import('viem').OneOf<
                                    | {maxFeePerGas: bigint}
                                    | {maxPriorityFeePerGas: bigint},
                                    import('viem').FeeValuesEIP1559
                                  > & {
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                  }))
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP1559
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | keyof import('viem').FeeValuesEIP1559<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip1559'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP1559
                                    : never)
                                ? 'eip1559'
                                : never)
                            | (request extends
                                | ({
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').ExactPartial<
                                    import('viem').FeeValuesLegacy
                                  > & {
                                      accessList:
                                        | import('viem').AccessList
                                        | undefined;
                                    })
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP2930
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | keyof import('viem').FeeValuesLegacy<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip2930'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP2930
                                    : never)
                                ? 'eip2930'
                                : never)
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?: undefined;
                                    blobs?:
                                      | readonly `0x${string}`[]
                                      | readonly Uint8Array[]
                                      | undefined;
                                    blobVersionedHashes?:
                                      | readonly `0x${string}`[]
                                      | undefined;
                                    maxFeePerBlobGas?: bigint | undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?:
                                      | false
                                      | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                      | undefined;
                                  } & (import('viem').ExactPartial<
                                    import('viem').FeeValuesEIP4844
                                  > &
                                    import('viem').OneOf<
                                      | {
                                          blobs:
                                            | readonly `0x${string}`[]
                                            | readonly Uint8Array[]
                                            | undefined;
                                        }
                                      | {
                                          blobVersionedHashes:
                                            | readonly `0x${string}`[]
                                            | undefined;
                                        }
                                      | {
                                          sidecars:
                                            | false
                                            | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                            | undefined;
                                        },
                                      import('viem').TransactionSerializableEIP4844
                                    >))
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'blobVersionedHashes'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        | 'blobs'
                                        | 'kzg'
                                        | 'sidecars'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP4844
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'from'
                                        | 'gas'
                                        | 'nonce'
                                        | 'to'
                                        | 'value'
                                        | 'accessList'
                                        | 'blobVersionedHashes'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        | 'blobs'
                                        | 'kzg'
                                        | 'sidecars'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP4844
                                    : never)
                                ? 'eip4844'
                                : never)
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?:
                                      | import('viem/experimental').SignedAuthorizationList
                                      | undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').ExactPartial<
                                    import('viem').FeeValuesEIP1559
                                  > & {
                                      authorizationList: import('viem/experimental').SignedAuthorizationList;
                                    })
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'authorizationList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP7702
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | 'authorizationList'
                                        | keyof import('viem').FeeValuesEIP1559<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip7702'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP7702
                                    : never)
                                ? 'eip7702'
                                : never)
                            | (request['type'] extends string | undefined
                                ? Extract<request['type'], string>
                                : never)
                          >
                  ) extends 'legacy'
                    ? import('viem').TransactionRequestLegacy
                    : never)
                | ((
                    request['type'] extends string | undefined
                      ? request['type']
                      : import('viem').GetTransactionType<
                            request,
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').FeeValuesLegacy)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableLegacy
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | keyof import('viem').FeeValuesLegacy<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'legacy'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestLegacy
                                    : never)
                                ? 'legacy'
                                : never)
                            | (request extends
                                | ({
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: undefined;
                                    maxFeePerBlobGas?: undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & (import('viem').OneOf<
                                    | {maxFeePerGas: bigint}
                                    | {maxPriorityFeePerGas: bigint},
                                    import('viem').FeeValuesEIP1559
                                  > & {
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                  }))
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP1559
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | keyof import('viem').FeeValuesEIP1559<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip1559'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP1559
                                    : never)
                                ? 'eip1559'
                                : never)
                            | (request extends
                                | ({
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').ExactPartial<
                                    import('viem').FeeValuesLegacy
                                  > & {
                                      accessList:
                                        | import('viem').AccessList
                                        | undefined;
                                    })
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP2930
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | keyof import('viem').FeeValuesLegacy<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip2930'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP2930
                                    : never)
                                ? 'eip2930'
                                : never)
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?: undefined;
                                    blobs?:
                                      | readonly `0x${string}`[]
                                      | readonly Uint8Array[]
                                      | undefined;
                                    blobVersionedHashes?:
                                      | readonly `0x${string}`[]
                                      | undefined;
                                    maxFeePerBlobGas?: bigint | undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?:
                                      | false
                                      | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                      | undefined;
                                  } & (import('viem').ExactPartial<
                                    import('viem').FeeValuesEIP4844
                                  > &
                                    import('viem').OneOf<
                                      | {
                                          blobs:
                                            | readonly `0x${string}`[]
                                            | readonly Uint8Array[]
                                            | undefined;
                                        }
                                      | {
                                          blobVersionedHashes:
                                            | readonly `0x${string}`[]
                                            | undefined;
                                        }
                                      | {
                                          sidecars:
                                            | false
                                            | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                            | undefined;
                                        },
                                      import('viem').TransactionSerializableEIP4844
                                    >))
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'blobVersionedHashes'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        | 'blobs'
                                        | 'kzg'
                                        | 'sidecars'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP4844
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'from'
                                        | 'gas'
                                        | 'nonce'
                                        | 'to'
                                        | 'value'
                                        | 'accessList'
                                        | 'blobVersionedHashes'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        | 'blobs'
                                        | 'kzg'
                                        | 'sidecars'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP4844
                                    : never)
                                ? 'eip4844'
                                : never)
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?:
                                      | import('viem/experimental').SignedAuthorizationList
                                      | undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').ExactPartial<
                                    import('viem').FeeValuesEIP1559
                                  > & {
                                      authorizationList: import('viem/experimental').SignedAuthorizationList;
                                    })
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'authorizationList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP7702
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | 'authorizationList'
                                        | keyof import('viem').FeeValuesEIP1559<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip7702'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP7702
                                    : never)
                                ? 'eip7702'
                                : never)
                            | (request['type'] extends string | undefined
                                ? Extract<request['type'], string>
                                : never)
                          > extends 'legacy'
                        ? unknown
                        : import('viem').GetTransactionType<
                            request,
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').FeeValuesLegacy)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableLegacy
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | keyof import('viem').FeeValuesLegacy<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'legacy'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestLegacy
                                    : never)
                                ? 'legacy'
                                : never)
                            | (request extends
                                | ({
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: undefined;
                                    maxFeePerBlobGas?: undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & (import('viem').OneOf<
                                    | {maxFeePerGas: bigint}
                                    | {maxPriorityFeePerGas: bigint},
                                    import('viem').FeeValuesEIP1559
                                  > & {
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                  }))
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP1559
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | keyof import('viem').FeeValuesEIP1559<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip1559'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP1559
                                    : never)
                                ? 'eip1559'
                                : never)
                            | (request extends
                                | ({
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').ExactPartial<
                                    import('viem').FeeValuesLegacy
                                  > & {
                                      accessList:
                                        | import('viem').AccessList
                                        | undefined;
                                    })
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP2930
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | keyof import('viem').FeeValuesLegacy<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip2930'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP2930
                                    : never)
                                ? 'eip2930'
                                : never)
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?: undefined;
                                    blobs?:
                                      | readonly `0x${string}`[]
                                      | readonly Uint8Array[]
                                      | undefined;
                                    blobVersionedHashes?:
                                      | readonly `0x${string}`[]
                                      | undefined;
                                    maxFeePerBlobGas?: bigint | undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?:
                                      | false
                                      | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                      | undefined;
                                  } & (import('viem').ExactPartial<
                                    import('viem').FeeValuesEIP4844
                                  > &
                                    import('viem').OneOf<
                                      | {
                                          blobs:
                                            | readonly `0x${string}`[]
                                            | readonly Uint8Array[]
                                            | undefined;
                                        }
                                      | {
                                          blobVersionedHashes:
                                            | readonly `0x${string}`[]
                                            | undefined;
                                        }
                                      | {
                                          sidecars:
                                            | false
                                            | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                            | undefined;
                                        },
                                      import('viem').TransactionSerializableEIP4844
                                    >))
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'blobVersionedHashes'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        | 'blobs'
                                        | 'kzg'
                                        | 'sidecars'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP4844
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'from'
                                        | 'gas'
                                        | 'nonce'
                                        | 'to'
                                        | 'value'
                                        | 'accessList'
                                        | 'blobVersionedHashes'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        | 'blobs'
                                        | 'kzg'
                                        | 'sidecars'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP4844
                                    : never)
                                ? 'eip4844'
                                : never)
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?:
                                      | import('viem/experimental').SignedAuthorizationList
                                      | undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').ExactPartial<
                                    import('viem').FeeValuesEIP1559
                                  > & {
                                      authorizationList: import('viem/experimental').SignedAuthorizationList;
                                    })
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'authorizationList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP7702
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | 'authorizationList'
                                        | keyof import('viem').FeeValuesEIP1559<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip7702'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP7702
                                    : never)
                                ? 'eip7702'
                                : never)
                            | (request['type'] extends string | undefined
                                ? Extract<request['type'], string>
                                : never)
                          >
                  ) extends 'eip1559'
                    ? import('viem').TransactionRequestEIP1559
                    : never)
                | ((
                    request['type'] extends string | undefined
                      ? request['type']
                      : import('viem').GetTransactionType<
                            request,
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').FeeValuesLegacy)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableLegacy
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | keyof import('viem').FeeValuesLegacy<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'legacy'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestLegacy
                                    : never)
                                ? 'legacy'
                                : never)
                            | (request extends
                                | ({
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: undefined;
                                    maxFeePerBlobGas?: undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & (import('viem').OneOf<
                                    | {maxFeePerGas: bigint}
                                    | {maxPriorityFeePerGas: bigint},
                                    import('viem').FeeValuesEIP1559
                                  > & {
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                  }))
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP1559
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | keyof import('viem').FeeValuesEIP1559<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip1559'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP1559
                                    : never)
                                ? 'eip1559'
                                : never)
                            | (request extends
                                | ({
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').ExactPartial<
                                    import('viem').FeeValuesLegacy
                                  > & {
                                      accessList:
                                        | import('viem').AccessList
                                        | undefined;
                                    })
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP2930
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | keyof import('viem').FeeValuesLegacy<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip2930'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP2930
                                    : never)
                                ? 'eip2930'
                                : never)
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?: undefined;
                                    blobs?:
                                      | readonly `0x${string}`[]
                                      | readonly Uint8Array[]
                                      | undefined;
                                    blobVersionedHashes?:
                                      | readonly `0x${string}`[]
                                      | undefined;
                                    maxFeePerBlobGas?: bigint | undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?:
                                      | false
                                      | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                      | undefined;
                                  } & (import('viem').ExactPartial<
                                    import('viem').FeeValuesEIP4844
                                  > &
                                    import('viem').OneOf<
                                      | {
                                          blobs:
                                            | readonly `0x${string}`[]
                                            | readonly Uint8Array[]
                                            | undefined;
                                        }
                                      | {
                                          blobVersionedHashes:
                                            | readonly `0x${string}`[]
                                            | undefined;
                                        }
                                      | {
                                          sidecars:
                                            | false
                                            | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                            | undefined;
                                        },
                                      import('viem').TransactionSerializableEIP4844
                                    >))
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'blobVersionedHashes'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        | 'blobs'
                                        | 'kzg'
                                        | 'sidecars'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP4844
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'from'
                                        | 'gas'
                                        | 'nonce'
                                        | 'to'
                                        | 'value'
                                        | 'accessList'
                                        | 'blobVersionedHashes'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        | 'blobs'
                                        | 'kzg'
                                        | 'sidecars'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP4844
                                    : never)
                                ? 'eip4844'
                                : never)
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?:
                                      | import('viem/experimental').SignedAuthorizationList
                                      | undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').ExactPartial<
                                    import('viem').FeeValuesEIP1559
                                  > & {
                                      authorizationList: import('viem/experimental').SignedAuthorizationList;
                                    })
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'authorizationList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP7702
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | 'authorizationList'
                                        | keyof import('viem').FeeValuesEIP1559<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip7702'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP7702
                                    : never)
                                ? 'eip7702'
                                : never)
                            | (request['type'] extends string | undefined
                                ? Extract<request['type'], string>
                                : never)
                          > extends 'legacy'
                        ? unknown
                        : import('viem').GetTransactionType<
                            request,
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').FeeValuesLegacy)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableLegacy
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | keyof import('viem').FeeValuesLegacy<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'legacy'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestLegacy
                                    : never)
                                ? 'legacy'
                                : never)
                            | (request extends
                                | ({
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: undefined;
                                    maxFeePerBlobGas?: undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & (import('viem').OneOf<
                                    | {maxFeePerGas: bigint}
                                    | {maxPriorityFeePerGas: bigint},
                                    import('viem').FeeValuesEIP1559
                                  > & {
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                  }))
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP1559
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | keyof import('viem').FeeValuesEIP1559<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip1559'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP1559
                                    : never)
                                ? 'eip1559'
                                : never)
                            | (request extends
                                | ({
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').ExactPartial<
                                    import('viem').FeeValuesLegacy
                                  > & {
                                      accessList:
                                        | import('viem').AccessList
                                        | undefined;
                                    })
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP2930
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | keyof import('viem').FeeValuesLegacy<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip2930'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP2930
                                    : never)
                                ? 'eip2930'
                                : never)
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?: undefined;
                                    blobs?:
                                      | readonly `0x${string}`[]
                                      | readonly Uint8Array[]
                                      | undefined;
                                    blobVersionedHashes?:
                                      | readonly `0x${string}`[]
                                      | undefined;
                                    maxFeePerBlobGas?: bigint | undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?:
                                      | false
                                      | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                      | undefined;
                                  } & (import('viem').ExactPartial<
                                    import('viem').FeeValuesEIP4844
                                  > &
                                    import('viem').OneOf<
                                      | {
                                          blobs:
                                            | readonly `0x${string}`[]
                                            | readonly Uint8Array[]
                                            | undefined;
                                        }
                                      | {
                                          blobVersionedHashes:
                                            | readonly `0x${string}`[]
                                            | undefined;
                                        }
                                      | {
                                          sidecars:
                                            | false
                                            | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                            | undefined;
                                        },
                                      import('viem').TransactionSerializableEIP4844
                                    >))
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'blobVersionedHashes'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        | 'blobs'
                                        | 'kzg'
                                        | 'sidecars'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP4844
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'from'
                                        | 'gas'
                                        | 'nonce'
                                        | 'to'
                                        | 'value'
                                        | 'accessList'
                                        | 'blobVersionedHashes'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        | 'blobs'
                                        | 'kzg'
                                        | 'sidecars'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP4844
                                    : never)
                                ? 'eip4844'
                                : never)
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?:
                                      | import('viem/experimental').SignedAuthorizationList
                                      | undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').ExactPartial<
                                    import('viem').FeeValuesEIP1559
                                  > & {
                                      authorizationList: import('viem/experimental').SignedAuthorizationList;
                                    })
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'authorizationList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP7702
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | 'authorizationList'
                                        | keyof import('viem').FeeValuesEIP1559<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip7702'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP7702
                                    : never)
                                ? 'eip7702'
                                : never)
                            | (request['type'] extends string | undefined
                                ? Extract<request['type'], string>
                                : never)
                          >
                  ) extends 'eip2930'
                    ? import('viem').TransactionRequestEIP2930
                    : never)
                | ((
                    request['type'] extends string | undefined
                      ? request['type']
                      : import('viem').GetTransactionType<
                            request,
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').FeeValuesLegacy)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableLegacy
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | keyof import('viem').FeeValuesLegacy<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'legacy'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestLegacy
                                    : never)
                                ? 'legacy'
                                : never)
                            | (request extends
                                | ({
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: undefined;
                                    maxFeePerBlobGas?: undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & (import('viem').OneOf<
                                    | {maxFeePerGas: bigint}
                                    | {maxPriorityFeePerGas: bigint},
                                    import('viem').FeeValuesEIP1559
                                  > & {
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                  }))
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP1559
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | keyof import('viem').FeeValuesEIP1559<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip1559'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP1559
                                    : never)
                                ? 'eip1559'
                                : never)
                            | (request extends
                                | ({
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').ExactPartial<
                                    import('viem').FeeValuesLegacy
                                  > & {
                                      accessList:
                                        | import('viem').AccessList
                                        | undefined;
                                    })
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP2930
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | keyof import('viem').FeeValuesLegacy<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip2930'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP2930
                                    : never)
                                ? 'eip2930'
                                : never)
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?: undefined;
                                    blobs?:
                                      | readonly `0x${string}`[]
                                      | readonly Uint8Array[]
                                      | undefined;
                                    blobVersionedHashes?:
                                      | readonly `0x${string}`[]
                                      | undefined;
                                    maxFeePerBlobGas?: bigint | undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?:
                                      | false
                                      | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                      | undefined;
                                  } & (import('viem').ExactPartial<
                                    import('viem').FeeValuesEIP4844
                                  > &
                                    import('viem').OneOf<
                                      | {
                                          blobs:
                                            | readonly `0x${string}`[]
                                            | readonly Uint8Array[]
                                            | undefined;
                                        }
                                      | {
                                          blobVersionedHashes:
                                            | readonly `0x${string}`[]
                                            | undefined;
                                        }
                                      | {
                                          sidecars:
                                            | false
                                            | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                            | undefined;
                                        },
                                      import('viem').TransactionSerializableEIP4844
                                    >))
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'blobVersionedHashes'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        | 'blobs'
                                        | 'kzg'
                                        | 'sidecars'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP4844
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'from'
                                        | 'gas'
                                        | 'nonce'
                                        | 'to'
                                        | 'value'
                                        | 'accessList'
                                        | 'blobVersionedHashes'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        | 'blobs'
                                        | 'kzg'
                                        | 'sidecars'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP4844
                                    : never)
                                ? 'eip4844'
                                : never)
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?:
                                      | import('viem/experimental').SignedAuthorizationList
                                      | undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').ExactPartial<
                                    import('viem').FeeValuesEIP1559
                                  > & {
                                      authorizationList: import('viem/experimental').SignedAuthorizationList;
                                    })
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'authorizationList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP7702
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | 'authorizationList'
                                        | keyof import('viem').FeeValuesEIP1559<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip7702'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP7702
                                    : never)
                                ? 'eip7702'
                                : never)
                            | (request['type'] extends string | undefined
                                ? Extract<request['type'], string>
                                : never)
                          > extends 'legacy'
                        ? unknown
                        : import('viem').GetTransactionType<
                            request,
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').FeeValuesLegacy)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableLegacy
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | keyof import('viem').FeeValuesLegacy<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'legacy'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestLegacy
                                    : never)
                                ? 'legacy'
                                : never)
                            | (request extends
                                | ({
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: undefined;
                                    maxFeePerBlobGas?: undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & (import('viem').OneOf<
                                    | {maxFeePerGas: bigint}
                                    | {maxPriorityFeePerGas: bigint},
                                    import('viem').FeeValuesEIP1559
                                  > & {
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                  }))
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP1559
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | keyof import('viem').FeeValuesEIP1559<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip1559'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP1559
                                    : never)
                                ? 'eip1559'
                                : never)
                            | (request extends
                                | ({
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').ExactPartial<
                                    import('viem').FeeValuesLegacy
                                  > & {
                                      accessList:
                                        | import('viem').AccessList
                                        | undefined;
                                    })
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP2930
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | keyof import('viem').FeeValuesLegacy<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip2930'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP2930
                                    : never)
                                ? 'eip2930'
                                : never)
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?: undefined;
                                    blobs?:
                                      | readonly `0x${string}`[]
                                      | readonly Uint8Array[]
                                      | undefined;
                                    blobVersionedHashes?:
                                      | readonly `0x${string}`[]
                                      | undefined;
                                    maxFeePerBlobGas?: bigint | undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?:
                                      | false
                                      | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                      | undefined;
                                  } & (import('viem').ExactPartial<
                                    import('viem').FeeValuesEIP4844
                                  > &
                                    import('viem').OneOf<
                                      | {
                                          blobs:
                                            | readonly `0x${string}`[]
                                            | readonly Uint8Array[]
                                            | undefined;
                                        }
                                      | {
                                          blobVersionedHashes:
                                            | readonly `0x${string}`[]
                                            | undefined;
                                        }
                                      | {
                                          sidecars:
                                            | false
                                            | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                            | undefined;
                                        },
                                      import('viem').TransactionSerializableEIP4844
                                    >))
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'blobVersionedHashes'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        | 'blobs'
                                        | 'kzg'
                                        | 'sidecars'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP4844
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'from'
                                        | 'gas'
                                        | 'nonce'
                                        | 'to'
                                        | 'value'
                                        | 'accessList'
                                        | 'blobVersionedHashes'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        | 'blobs'
                                        | 'kzg'
                                        | 'sidecars'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP4844
                                    : never)
                                ? 'eip4844'
                                : never)
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?:
                                      | import('viem/experimental').SignedAuthorizationList
                                      | undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').ExactPartial<
                                    import('viem').FeeValuesEIP1559
                                  > & {
                                      authorizationList: import('viem/experimental').SignedAuthorizationList;
                                    })
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'authorizationList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP7702
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | 'authorizationList'
                                        | keyof import('viem').FeeValuesEIP1559<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip7702'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP7702
                                    : never)
                                ? 'eip7702'
                                : never)
                            | (request['type'] extends string | undefined
                                ? Extract<request['type'], string>
                                : never)
                          >
                  ) extends 'eip4844'
                    ? import('viem').TransactionRequestEIP4844
                    : never)
                | ((
                    request['type'] extends string | undefined
                      ? request['type']
                      : import('viem').GetTransactionType<
                            request,
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').FeeValuesLegacy)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableLegacy
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | keyof import('viem').FeeValuesLegacy<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'legacy'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestLegacy
                                    : never)
                                ? 'legacy'
                                : never)
                            | (request extends
                                | ({
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: undefined;
                                    maxFeePerBlobGas?: undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & (import('viem').OneOf<
                                    | {maxFeePerGas: bigint}
                                    | {maxPriorityFeePerGas: bigint},
                                    import('viem').FeeValuesEIP1559
                                  > & {
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                  }))
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP1559
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | keyof import('viem').FeeValuesEIP1559<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip1559'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP1559
                                    : never)
                                ? 'eip1559'
                                : never)
                            | (request extends
                                | ({
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').ExactPartial<
                                    import('viem').FeeValuesLegacy
                                  > & {
                                      accessList:
                                        | import('viem').AccessList
                                        | undefined;
                                    })
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP2930
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | keyof import('viem').FeeValuesLegacy<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip2930'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP2930
                                    : never)
                                ? 'eip2930'
                                : never)
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?: undefined;
                                    blobs?:
                                      | readonly `0x${string}`[]
                                      | readonly Uint8Array[]
                                      | undefined;
                                    blobVersionedHashes?:
                                      | readonly `0x${string}`[]
                                      | undefined;
                                    maxFeePerBlobGas?: bigint | undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?:
                                      | false
                                      | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                      | undefined;
                                  } & (import('viem').ExactPartial<
                                    import('viem').FeeValuesEIP4844
                                  > &
                                    import('viem').OneOf<
                                      | {
                                          blobs:
                                            | readonly `0x${string}`[]
                                            | readonly Uint8Array[]
                                            | undefined;
                                        }
                                      | {
                                          blobVersionedHashes:
                                            | readonly `0x${string}`[]
                                            | undefined;
                                        }
                                      | {
                                          sidecars:
                                            | false
                                            | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                            | undefined;
                                        },
                                      import('viem').TransactionSerializableEIP4844
                                    >))
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'blobVersionedHashes'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        | 'blobs'
                                        | 'kzg'
                                        | 'sidecars'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP4844
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'from'
                                        | 'gas'
                                        | 'nonce'
                                        | 'to'
                                        | 'value'
                                        | 'accessList'
                                        | 'blobVersionedHashes'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        | 'blobs'
                                        | 'kzg'
                                        | 'sidecars'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP4844
                                    : never)
                                ? 'eip4844'
                                : never)
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?:
                                      | import('viem/experimental').SignedAuthorizationList
                                      | undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').ExactPartial<
                                    import('viem').FeeValuesEIP1559
                                  > & {
                                      authorizationList: import('viem/experimental').SignedAuthorizationList;
                                    })
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'authorizationList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP7702
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | 'authorizationList'
                                        | keyof import('viem').FeeValuesEIP1559<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip7702'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP7702
                                    : never)
                                ? 'eip7702'
                                : never)
                            | (request['type'] extends string | undefined
                                ? Extract<request['type'], string>
                                : never)
                          > extends 'legacy'
                        ? unknown
                        : import('viem').GetTransactionType<
                            request,
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').FeeValuesLegacy)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableLegacy
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | keyof import('viem').FeeValuesLegacy<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'legacy'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestLegacy
                                    : never)
                                ? 'legacy'
                                : never)
                            | (request extends
                                | ({
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: undefined;
                                    maxFeePerBlobGas?: undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & (import('viem').OneOf<
                                    | {maxFeePerGas: bigint}
                                    | {maxPriorityFeePerGas: bigint},
                                    import('viem').FeeValuesEIP1559
                                  > & {
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                  }))
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP1559
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | keyof import('viem').FeeValuesEIP1559<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip1559'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP1559
                                    : never)
                                ? 'eip1559'
                                : never)
                            | (request extends
                                | ({
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').ExactPartial<
                                    import('viem').FeeValuesLegacy
                                  > & {
                                      accessList:
                                        | import('viem').AccessList
                                        | undefined;
                                    })
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP2930
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | keyof import('viem').FeeValuesLegacy<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip2930'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP2930
                                    : never)
                                ? 'eip2930'
                                : never)
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?: undefined;
                                    blobs?:
                                      | readonly `0x${string}`[]
                                      | readonly Uint8Array[]
                                      | undefined;
                                    blobVersionedHashes?:
                                      | readonly `0x${string}`[]
                                      | undefined;
                                    maxFeePerBlobGas?: bigint | undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?:
                                      | false
                                      | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                      | undefined;
                                  } & (import('viem').ExactPartial<
                                    import('viem').FeeValuesEIP4844
                                  > &
                                    import('viem').OneOf<
                                      | {
                                          blobs:
                                            | readonly `0x${string}`[]
                                            | readonly Uint8Array[]
                                            | undefined;
                                        }
                                      | {
                                          blobVersionedHashes:
                                            | readonly `0x${string}`[]
                                            | undefined;
                                        }
                                      | {
                                          sidecars:
                                            | false
                                            | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                            | undefined;
                                        },
                                      import('viem').TransactionSerializableEIP4844
                                    >))
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'blobVersionedHashes'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        | 'blobs'
                                        | 'kzg'
                                        | 'sidecars'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP4844
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'from'
                                        | 'gas'
                                        | 'nonce'
                                        | 'to'
                                        | 'value'
                                        | 'accessList'
                                        | 'blobVersionedHashes'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        | 'blobs'
                                        | 'kzg'
                                        | 'sidecars'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP4844
                                    : never)
                                ? 'eip4844'
                                : never)
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?:
                                      | import('viem/experimental').SignedAuthorizationList
                                      | undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').ExactPartial<
                                    import('viem').FeeValuesEIP1559
                                  > & {
                                      authorizationList: import('viem/experimental').SignedAuthorizationList;
                                    })
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'authorizationList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP7702
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | 'authorizationList'
                                        | keyof import('viem').FeeValuesEIP1559<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip7702'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP7702
                                    : never)
                                ? 'eip7702'
                                : never)
                            | (request['type'] extends string | undefined
                                ? Extract<request['type'], string>
                                : never)
                          >
                  ) extends 'eip7702'
                    ? import('viem').TransactionRequestEIP7702
                    : never)
              >
        > & {chainId?: number | undefined},
        (
          request['parameters'] extends readonly import('viem').PrepareTransactionRequestParameterType[]
            ? request['parameters'][number]
            :
                | 'fees'
                | 'gas'
                | 'nonce'
                | 'blobVersionedHashes'
                | 'chainId'
                | 'type'
        ) extends 'fees'
          ? 'gasPrice' | 'maxFeePerGas' | 'maxPriorityFeePerGas'
          : request['parameters'] extends readonly import('viem').PrepareTransactionRequestParameterType[]
            ? request['parameters'][number]
            :
                | 'fees'
                | 'gas'
                | 'nonce'
                | 'blobVersionedHashes'
                | 'chainId'
                | 'type'
      > &
        (unknown extends request['kzg']
          ? {}
          : Pick<request, 'kzg'>))]: (import('viem').UnionRequiredBy<
        Extract<
          import('viem').UnionOmit<
            import('viem').ExtractChainFormatterParameters<
              import('viem').DeriveChain<
                {
                  blockExplorers: {
                    readonly default: {
                      readonly name: 'Arbiscan';
                      readonly url: 'https://arbiscan.io';
                      readonly apiUrl: 'https://api.arbiscan.io/api';
                    };
                  };
                  contracts: {
                    readonly multicall3: {
                      readonly address: '0xca11bde05977b3631167028862be2a173976ca11';
                      readonly blockCreated: 7654707;
                    };
                  };
                  id: 42161;
                  name: 'Arbitrum One';
                  nativeCurrency: {
                    readonly name: 'Ether';
                    readonly symbol: 'ETH';
                    readonly decimals: 18;
                  };
                  rpcUrls: {
                    readonly default: {
                      readonly http: readonly ['https://arb1.arbitrum.io/rpc'];
                    };
                  };
                  sourceId?: number | undefined;
                  testnet?: boolean | undefined;
                  custom?: Record<string, unknown> | undefined;
                  fees?: import('viem').ChainFees<undefined> | undefined;
                  formatters?: undefined;
                  serializers?:
                    | import('viem').ChainSerializers<
                        undefined,
                        import('viem').TransactionSerializable<bigint, number>
                      >
                    | undefined;
                },
                chainOverride
              >,
              'transactionRequest',
              import('viem').TransactionRequest
            >,
            'from'
          > &
            (import('viem').DeriveChain<
              {
                blockExplorers: {
                  readonly default: {
                    readonly name: 'Arbiscan';
                    readonly url: 'https://arbiscan.io';
                    readonly apiUrl: 'https://api.arbiscan.io/api';
                  };
                };
                contracts: {
                  readonly multicall3: {
                    readonly address: '0xca11bde05977b3631167028862be2a173976ca11';
                    readonly blockCreated: 7654707;
                  };
                };
                id: 42161;
                name: 'Arbitrum One';
                nativeCurrency: {
                  readonly name: 'Ether';
                  readonly symbol: 'ETH';
                  readonly decimals: 18;
                };
                rpcUrls: {
                  readonly default: {
                    readonly http: readonly ['https://arb1.arbitrum.io/rpc'];
                  };
                };
                sourceId?: number | undefined;
                testnet?: boolean | undefined;
                custom?: Record<string, unknown> | undefined;
                fees?: import('viem').ChainFees<undefined> | undefined;
                formatters?: undefined;
                serializers?:
                  | import('viem').ChainSerializers<
                      undefined,
                      import('viem').TransactionSerializable<bigint, number>
                    >
                  | undefined;
              },
              chainOverride
            > extends import('viem').Chain
              ? {
                  chain: import('viem').DeriveChain<
                    {
                      blockExplorers: {
                        readonly default: {
                          readonly name: 'Arbiscan';
                          readonly url: 'https://arbiscan.io';
                          readonly apiUrl: 'https://api.arbiscan.io/api';
                        };
                      };
                      contracts: {
                        readonly multicall3: {
                          readonly address: '0xca11bde05977b3631167028862be2a173976ca11';
                          readonly blockCreated: 7654707;
                        };
                      };
                      id: 42161;
                      name: 'Arbitrum One';
                      nativeCurrency: {
                        readonly name: 'Ether';
                        readonly symbol: 'ETH';
                        readonly decimals: 18;
                      };
                      rpcUrls: {
                        readonly default: {
                          readonly http: readonly [
                            'https://arb1.arbitrum.io/rpc',
                          ];
                        };
                      };
                      sourceId?: number | undefined;
                      testnet?: boolean | undefined;
                      custom?: Record<string, unknown> | undefined;
                      fees?: import('viem').ChainFees<undefined> | undefined;
                      formatters?: undefined;
                      serializers?:
                        | import('viem').ChainSerializers<
                            undefined,
                            import('viem').TransactionSerializable<
                              bigint,
                              number
                            >
                          >
                        | undefined;
                    },
                    chainOverride
                  >;
                }
              : {chain?: undefined}) &
            (import('viem').DeriveAccount<
              import('viem').Account | undefined,
              accountOverride
            > extends import('viem').Account
              ? {
                  account: import('viem').Account &
                    import('viem').DeriveAccount<
                      import('viem').Account | undefined,
                      accountOverride
                    >;
                  from: `0x${string}`;
                }
              : {account?: undefined; from?: undefined}),
          import('viem').IsNever<
            | ((
                request['type'] extends string | undefined
                  ? request['type']
                  : import('viem').GetTransactionType<
                        request,
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').FeeValuesLegacy)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableLegacy
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | keyof import('viem').FeeValuesLegacy<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'legacy'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestLegacy
                                : never)
                            ? 'legacy'
                            : never)
                        | (request extends
                            | ({
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: undefined;
                                maxFeePerBlobGas?: undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?: undefined;
                              } & (import('viem').OneOf<
                                | {maxFeePerGas: bigint}
                                | {maxPriorityFeePerGas: bigint},
                                import('viem').FeeValuesEIP1559
                              > & {
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                              }))
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP1559
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | keyof import('viem').FeeValuesEIP1559<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip1559'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP1559
                                : never)
                            ? 'eip1559'
                            : never)
                        | (request extends
                            | ({
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').ExactPartial<
                                import('viem').FeeValuesLegacy
                              > & {
                                  accessList:
                                    | import('viem').AccessList
                                    | undefined;
                                })
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP2930
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | keyof import('viem').FeeValuesLegacy<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip2930'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP2930
                                : never)
                            ? 'eip2930'
                            : never)
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?: undefined;
                                blobs?:
                                  | readonly `0x${string}`[]
                                  | readonly Uint8Array[]
                                  | undefined;
                                blobVersionedHashes?:
                                  | readonly `0x${string}`[]
                                  | undefined;
                                maxFeePerBlobGas?: bigint | undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?:
                                  | false
                                  | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                  | undefined;
                              } & (import('viem').ExactPartial<
                                import('viem').FeeValuesEIP4844
                              > &
                                import('viem').OneOf<
                                  | {
                                      blobs:
                                        | readonly `0x${string}`[]
                                        | readonly Uint8Array[]
                                        | undefined;
                                    }
                                  | {
                                      blobVersionedHashes:
                                        | readonly `0x${string}`[]
                                        | undefined;
                                    }
                                  | {
                                      sidecars:
                                        | false
                                        | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                        | undefined;
                                    },
                                  import('viem').TransactionSerializableEIP4844
                                >))
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'blobVersionedHashes'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    | 'blobs'
                                    | 'kzg'
                                    | 'sidecars'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP4844
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'from'
                                    | 'gas'
                                    | 'nonce'
                                    | 'to'
                                    | 'value'
                                    | 'accessList'
                                    | 'blobVersionedHashes'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    | 'blobs'
                                    | 'kzg'
                                    | 'sidecars'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP4844
                                : never)
                            ? 'eip4844'
                            : never)
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?:
                                  | import('viem/experimental').SignedAuthorizationList
                                  | undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').ExactPartial<
                                import('viem').FeeValuesEIP1559
                              > & {
                                  authorizationList: import('viem/experimental').SignedAuthorizationList;
                                })
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'authorizationList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP7702
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | 'authorizationList'
                                    | keyof import('viem').FeeValuesEIP1559<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip7702'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP7702
                                : never)
                            ? 'eip7702'
                            : never)
                        | (request['type'] extends string | undefined
                            ? Extract<request['type'], string>
                            : never)
                      > extends 'legacy'
                    ? unknown
                    : import('viem').GetTransactionType<
                        request,
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').FeeValuesLegacy)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableLegacy
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | keyof import('viem').FeeValuesLegacy<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'legacy'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestLegacy
                                : never)
                            ? 'legacy'
                            : never)
                        | (request extends
                            | ({
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: undefined;
                                maxFeePerBlobGas?: undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?: undefined;
                              } & (import('viem').OneOf<
                                | {maxFeePerGas: bigint}
                                | {maxPriorityFeePerGas: bigint},
                                import('viem').FeeValuesEIP1559
                              > & {
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                              }))
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP1559
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | keyof import('viem').FeeValuesEIP1559<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip1559'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP1559
                                : never)
                            ? 'eip1559'
                            : never)
                        | (request extends
                            | ({
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').ExactPartial<
                                import('viem').FeeValuesLegacy
                              > & {
                                  accessList:
                                    | import('viem').AccessList
                                    | undefined;
                                })
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP2930
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | keyof import('viem').FeeValuesLegacy<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip2930'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP2930
                                : never)
                            ? 'eip2930'
                            : never)
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?: undefined;
                                blobs?:
                                  | readonly `0x${string}`[]
                                  | readonly Uint8Array[]
                                  | undefined;
                                blobVersionedHashes?:
                                  | readonly `0x${string}`[]
                                  | undefined;
                                maxFeePerBlobGas?: bigint | undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?:
                                  | false
                                  | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                  | undefined;
                              } & (import('viem').ExactPartial<
                                import('viem').FeeValuesEIP4844
                              > &
                                import('viem').OneOf<
                                  | {
                                      blobs:
                                        | readonly `0x${string}`[]
                                        | readonly Uint8Array[]
                                        | undefined;
                                    }
                                  | {
                                      blobVersionedHashes:
                                        | readonly `0x${string}`[]
                                        | undefined;
                                    }
                                  | {
                                      sidecars:
                                        | false
                                        | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                        | undefined;
                                    },
                                  import('viem').TransactionSerializableEIP4844
                                >))
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'blobVersionedHashes'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    | 'blobs'
                                    | 'kzg'
                                    | 'sidecars'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP4844
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'from'
                                    | 'gas'
                                    | 'nonce'
                                    | 'to'
                                    | 'value'
                                    | 'accessList'
                                    | 'blobVersionedHashes'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    | 'blobs'
                                    | 'kzg'
                                    | 'sidecars'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP4844
                                : never)
                            ? 'eip4844'
                            : never)
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?:
                                  | import('viem/experimental').SignedAuthorizationList
                                  | undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').ExactPartial<
                                import('viem').FeeValuesEIP1559
                              > & {
                                  authorizationList: import('viem/experimental').SignedAuthorizationList;
                                })
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'authorizationList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP7702
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | 'authorizationList'
                                    | keyof import('viem').FeeValuesEIP1559<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip7702'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP7702
                                : never)
                            ? 'eip7702'
                            : never)
                        | (request['type'] extends string | undefined
                            ? Extract<request['type'], string>
                            : never)
                      >
              ) extends 'legacy'
                ? import('viem').TransactionRequestLegacy
                : never)
            | ((
                request['type'] extends string | undefined
                  ? request['type']
                  : import('viem').GetTransactionType<
                        request,
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').FeeValuesLegacy)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableLegacy
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | keyof import('viem').FeeValuesLegacy<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'legacy'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestLegacy
                                : never)
                            ? 'legacy'
                            : never)
                        | (request extends
                            | ({
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: undefined;
                                maxFeePerBlobGas?: undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?: undefined;
                              } & (import('viem').OneOf<
                                | {maxFeePerGas: bigint}
                                | {maxPriorityFeePerGas: bigint},
                                import('viem').FeeValuesEIP1559
                              > & {
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                              }))
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP1559
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | keyof import('viem').FeeValuesEIP1559<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip1559'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP1559
                                : never)
                            ? 'eip1559'
                            : never)
                        | (request extends
                            | ({
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').ExactPartial<
                                import('viem').FeeValuesLegacy
                              > & {
                                  accessList:
                                    | import('viem').AccessList
                                    | undefined;
                                })
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP2930
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | keyof import('viem').FeeValuesLegacy<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip2930'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP2930
                                : never)
                            ? 'eip2930'
                            : never)
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?: undefined;
                                blobs?:
                                  | readonly `0x${string}`[]
                                  | readonly Uint8Array[]
                                  | undefined;
                                blobVersionedHashes?:
                                  | readonly `0x${string}`[]
                                  | undefined;
                                maxFeePerBlobGas?: bigint | undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?:
                                  | false
                                  | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                  | undefined;
                              } & (import('viem').ExactPartial<
                                import('viem').FeeValuesEIP4844
                              > &
                                import('viem').OneOf<
                                  | {
                                      blobs:
                                        | readonly `0x${string}`[]
                                        | readonly Uint8Array[]
                                        | undefined;
                                    }
                                  | {
                                      blobVersionedHashes:
                                        | readonly `0x${string}`[]
                                        | undefined;
                                    }
                                  | {
                                      sidecars:
                                        | false
                                        | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                        | undefined;
                                    },
                                  import('viem').TransactionSerializableEIP4844
                                >))
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'blobVersionedHashes'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    | 'blobs'
                                    | 'kzg'
                                    | 'sidecars'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP4844
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'from'
                                    | 'gas'
                                    | 'nonce'
                                    | 'to'
                                    | 'value'
                                    | 'accessList'
                                    | 'blobVersionedHashes'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    | 'blobs'
                                    | 'kzg'
                                    | 'sidecars'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP4844
                                : never)
                            ? 'eip4844'
                            : never)
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?:
                                  | import('viem/experimental').SignedAuthorizationList
                                  | undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').ExactPartial<
                                import('viem').FeeValuesEIP1559
                              > & {
                                  authorizationList: import('viem/experimental').SignedAuthorizationList;
                                })
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'authorizationList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP7702
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | 'authorizationList'
                                    | keyof import('viem').FeeValuesEIP1559<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip7702'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP7702
                                : never)
                            ? 'eip7702'
                            : never)
                        | (request['type'] extends string | undefined
                            ? Extract<request['type'], string>
                            : never)
                      > extends 'legacy'
                    ? unknown
                    : import('viem').GetTransactionType<
                        request,
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').FeeValuesLegacy)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableLegacy
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | keyof import('viem').FeeValuesLegacy<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'legacy'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestLegacy
                                : never)
                            ? 'legacy'
                            : never)
                        | (request extends
                            | ({
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: undefined;
                                maxFeePerBlobGas?: undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?: undefined;
                              } & (import('viem').OneOf<
                                | {maxFeePerGas: bigint}
                                | {maxPriorityFeePerGas: bigint},
                                import('viem').FeeValuesEIP1559
                              > & {
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                              }))
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP1559
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | keyof import('viem').FeeValuesEIP1559<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip1559'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP1559
                                : never)
                            ? 'eip1559'
                            : never)
                        | (request extends
                            | ({
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').ExactPartial<
                                import('viem').FeeValuesLegacy
                              > & {
                                  accessList:
                                    | import('viem').AccessList
                                    | undefined;
                                })
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP2930
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | keyof import('viem').FeeValuesLegacy<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip2930'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP2930
                                : never)
                            ? 'eip2930'
                            : never)
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?: undefined;
                                blobs?:
                                  | readonly `0x${string}`[]
                                  | readonly Uint8Array[]
                                  | undefined;
                                blobVersionedHashes?:
                                  | readonly `0x${string}`[]
                                  | undefined;
                                maxFeePerBlobGas?: bigint | undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?:
                                  | false
                                  | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                  | undefined;
                              } & (import('viem').ExactPartial<
                                import('viem').FeeValuesEIP4844
                              > &
                                import('viem').OneOf<
                                  | {
                                      blobs:
                                        | readonly `0x${string}`[]
                                        | readonly Uint8Array[]
                                        | undefined;
                                    }
                                  | {
                                      blobVersionedHashes:
                                        | readonly `0x${string}`[]
                                        | undefined;
                                    }
                                  | {
                                      sidecars:
                                        | false
                                        | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                        | undefined;
                                    },
                                  import('viem').TransactionSerializableEIP4844
                                >))
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'blobVersionedHashes'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    | 'blobs'
                                    | 'kzg'
                                    | 'sidecars'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP4844
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'from'
                                    | 'gas'
                                    | 'nonce'
                                    | 'to'
                                    | 'value'
                                    | 'accessList'
                                    | 'blobVersionedHashes'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    | 'blobs'
                                    | 'kzg'
                                    | 'sidecars'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP4844
                                : never)
                            ? 'eip4844'
                            : never)
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?:
                                  | import('viem/experimental').SignedAuthorizationList
                                  | undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').ExactPartial<
                                import('viem').FeeValuesEIP1559
                              > & {
                                  authorizationList: import('viem/experimental').SignedAuthorizationList;
                                })
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'authorizationList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP7702
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | 'authorizationList'
                                    | keyof import('viem').FeeValuesEIP1559<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip7702'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP7702
                                : never)
                            ? 'eip7702'
                            : never)
                        | (request['type'] extends string | undefined
                            ? Extract<request['type'], string>
                            : never)
                      >
              ) extends 'eip1559'
                ? import('viem').TransactionRequestEIP1559
                : never)
            | ((
                request['type'] extends string | undefined
                  ? request['type']
                  : import('viem').GetTransactionType<
                        request,
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').FeeValuesLegacy)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableLegacy
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | keyof import('viem').FeeValuesLegacy<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'legacy'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestLegacy
                                : never)
                            ? 'legacy'
                            : never)
                        | (request extends
                            | ({
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: undefined;
                                maxFeePerBlobGas?: undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?: undefined;
                              } & (import('viem').OneOf<
                                | {maxFeePerGas: bigint}
                                | {maxPriorityFeePerGas: bigint},
                                import('viem').FeeValuesEIP1559
                              > & {
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                              }))
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP1559
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | keyof import('viem').FeeValuesEIP1559<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip1559'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP1559
                                : never)
                            ? 'eip1559'
                            : never)
                        | (request extends
                            | ({
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').ExactPartial<
                                import('viem').FeeValuesLegacy
                              > & {
                                  accessList:
                                    | import('viem').AccessList
                                    | undefined;
                                })
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP2930
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | keyof import('viem').FeeValuesLegacy<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip2930'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP2930
                                : never)
                            ? 'eip2930'
                            : never)
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?: undefined;
                                blobs?:
                                  | readonly `0x${string}`[]
                                  | readonly Uint8Array[]
                                  | undefined;
                                blobVersionedHashes?:
                                  | readonly `0x${string}`[]
                                  | undefined;
                                maxFeePerBlobGas?: bigint | undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?:
                                  | false
                                  | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                  | undefined;
                              } & (import('viem').ExactPartial<
                                import('viem').FeeValuesEIP4844
                              > &
                                import('viem').OneOf<
                                  | {
                                      blobs:
                                        | readonly `0x${string}`[]
                                        | readonly Uint8Array[]
                                        | undefined;
                                    }
                                  | {
                                      blobVersionedHashes:
                                        | readonly `0x${string}`[]
                                        | undefined;
                                    }
                                  | {
                                      sidecars:
                                        | false
                                        | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                        | undefined;
                                    },
                                  import('viem').TransactionSerializableEIP4844
                                >))
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'blobVersionedHashes'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    | 'blobs'
                                    | 'kzg'
                                    | 'sidecars'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP4844
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'from'
                                    | 'gas'
                                    | 'nonce'
                                    | 'to'
                                    | 'value'
                                    | 'accessList'
                                    | 'blobVersionedHashes'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    | 'blobs'
                                    | 'kzg'
                                    | 'sidecars'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP4844
                                : never)
                            ? 'eip4844'
                            : never)
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?:
                                  | import('viem/experimental').SignedAuthorizationList
                                  | undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').ExactPartial<
                                import('viem').FeeValuesEIP1559
                              > & {
                                  authorizationList: import('viem/experimental').SignedAuthorizationList;
                                })
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'authorizationList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP7702
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | 'authorizationList'
                                    | keyof import('viem').FeeValuesEIP1559<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip7702'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP7702
                                : never)
                            ? 'eip7702'
                            : never)
                        | (request['type'] extends string | undefined
                            ? Extract<request['type'], string>
                            : never)
                      > extends 'legacy'
                    ? unknown
                    : import('viem').GetTransactionType<
                        request,
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').FeeValuesLegacy)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableLegacy
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | keyof import('viem').FeeValuesLegacy<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'legacy'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestLegacy
                                : never)
                            ? 'legacy'
                            : never)
                        | (request extends
                            | ({
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: undefined;
                                maxFeePerBlobGas?: undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?: undefined;
                              } & (import('viem').OneOf<
                                | {maxFeePerGas: bigint}
                                | {maxPriorityFeePerGas: bigint},
                                import('viem').FeeValuesEIP1559
                              > & {
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                              }))
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP1559
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | keyof import('viem').FeeValuesEIP1559<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip1559'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP1559
                                : never)
                            ? 'eip1559'
                            : never)
                        | (request extends
                            | ({
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').ExactPartial<
                                import('viem').FeeValuesLegacy
                              > & {
                                  accessList:
                                    | import('viem').AccessList
                                    | undefined;
                                })
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP2930
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | keyof import('viem').FeeValuesLegacy<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip2930'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP2930
                                : never)
                            ? 'eip2930'
                            : never)
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?: undefined;
                                blobs?:
                                  | readonly `0x${string}`[]
                                  | readonly Uint8Array[]
                                  | undefined;
                                blobVersionedHashes?:
                                  | readonly `0x${string}`[]
                                  | undefined;
                                maxFeePerBlobGas?: bigint | undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?:
                                  | false
                                  | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                  | undefined;
                              } & (import('viem').ExactPartial<
                                import('viem').FeeValuesEIP4844
                              > &
                                import('viem').OneOf<
                                  | {
                                      blobs:
                                        | readonly `0x${string}`[]
                                        | readonly Uint8Array[]
                                        | undefined;
                                    }
                                  | {
                                      blobVersionedHashes:
                                        | readonly `0x${string}`[]
                                        | undefined;
                                    }
                                  | {
                                      sidecars:
                                        | false
                                        | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                        | undefined;
                                    },
                                  import('viem').TransactionSerializableEIP4844
                                >))
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'blobVersionedHashes'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    | 'blobs'
                                    | 'kzg'
                                    | 'sidecars'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP4844
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'from'
                                    | 'gas'
                                    | 'nonce'
                                    | 'to'
                                    | 'value'
                                    | 'accessList'
                                    | 'blobVersionedHashes'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    | 'blobs'
                                    | 'kzg'
                                    | 'sidecars'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP4844
                                : never)
                            ? 'eip4844'
                            : never)
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?:
                                  | import('viem/experimental').SignedAuthorizationList
                                  | undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').ExactPartial<
                                import('viem').FeeValuesEIP1559
                              > & {
                                  authorizationList: import('viem/experimental').SignedAuthorizationList;
                                })
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'authorizationList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP7702
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | 'authorizationList'
                                    | keyof import('viem').FeeValuesEIP1559<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip7702'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP7702
                                : never)
                            ? 'eip7702'
                            : never)
                        | (request['type'] extends string | undefined
                            ? Extract<request['type'], string>
                            : never)
                      >
              ) extends 'eip2930'
                ? import('viem').TransactionRequestEIP2930
                : never)
            | ((
                request['type'] extends string | undefined
                  ? request['type']
                  : import('viem').GetTransactionType<
                        request,
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').FeeValuesLegacy)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableLegacy
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | keyof import('viem').FeeValuesLegacy<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'legacy'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestLegacy
                                : never)
                            ? 'legacy'
                            : never)
                        | (request extends
                            | ({
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: undefined;
                                maxFeePerBlobGas?: undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?: undefined;
                              } & (import('viem').OneOf<
                                | {maxFeePerGas: bigint}
                                | {maxPriorityFeePerGas: bigint},
                                import('viem').FeeValuesEIP1559
                              > & {
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                              }))
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP1559
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | keyof import('viem').FeeValuesEIP1559<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip1559'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP1559
                                : never)
                            ? 'eip1559'
                            : never)
                        | (request extends
                            | ({
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').ExactPartial<
                                import('viem').FeeValuesLegacy
                              > & {
                                  accessList:
                                    | import('viem').AccessList
                                    | undefined;
                                })
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP2930
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | keyof import('viem').FeeValuesLegacy<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip2930'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP2930
                                : never)
                            ? 'eip2930'
                            : never)
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?: undefined;
                                blobs?:
                                  | readonly `0x${string}`[]
                                  | readonly Uint8Array[]
                                  | undefined;
                                blobVersionedHashes?:
                                  | readonly `0x${string}`[]
                                  | undefined;
                                maxFeePerBlobGas?: bigint | undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?:
                                  | false
                                  | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                  | undefined;
                              } & (import('viem').ExactPartial<
                                import('viem').FeeValuesEIP4844
                              > &
                                import('viem').OneOf<
                                  | {
                                      blobs:
                                        | readonly `0x${string}`[]
                                        | readonly Uint8Array[]
                                        | undefined;
                                    }
                                  | {
                                      blobVersionedHashes:
                                        | readonly `0x${string}`[]
                                        | undefined;
                                    }
                                  | {
                                      sidecars:
                                        | false
                                        | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                        | undefined;
                                    },
                                  import('viem').TransactionSerializableEIP4844
                                >))
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'blobVersionedHashes'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    | 'blobs'
                                    | 'kzg'
                                    | 'sidecars'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP4844
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'from'
                                    | 'gas'
                                    | 'nonce'
                                    | 'to'
                                    | 'value'
                                    | 'accessList'
                                    | 'blobVersionedHashes'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    | 'blobs'
                                    | 'kzg'
                                    | 'sidecars'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP4844
                                : never)
                            ? 'eip4844'
                            : never)
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?:
                                  | import('viem/experimental').SignedAuthorizationList
                                  | undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').ExactPartial<
                                import('viem').FeeValuesEIP1559
                              > & {
                                  authorizationList: import('viem/experimental').SignedAuthorizationList;
                                })
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'authorizationList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP7702
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | 'authorizationList'
                                    | keyof import('viem').FeeValuesEIP1559<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip7702'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP7702
                                : never)
                            ? 'eip7702'
                            : never)
                        | (request['type'] extends string | undefined
                            ? Extract<request['type'], string>
                            : never)
                      > extends 'legacy'
                    ? unknown
                    : import('viem').GetTransactionType<
                        request,
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').FeeValuesLegacy)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableLegacy
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | keyof import('viem').FeeValuesLegacy<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'legacy'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestLegacy
                                : never)
                            ? 'legacy'
                            : never)
                        | (request extends
                            | ({
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: undefined;
                                maxFeePerBlobGas?: undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?: undefined;
                              } & (import('viem').OneOf<
                                | {maxFeePerGas: bigint}
                                | {maxPriorityFeePerGas: bigint},
                                import('viem').FeeValuesEIP1559
                              > & {
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                              }))
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP1559
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | keyof import('viem').FeeValuesEIP1559<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip1559'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP1559
                                : never)
                            ? 'eip1559'
                            : never)
                        | (request extends
                            | ({
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').ExactPartial<
                                import('viem').FeeValuesLegacy
                              > & {
                                  accessList:
                                    | import('viem').AccessList
                                    | undefined;
                                })
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP2930
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | keyof import('viem').FeeValuesLegacy<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip2930'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP2930
                                : never)
                            ? 'eip2930'
                            : never)
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?: undefined;
                                blobs?:
                                  | readonly `0x${string}`[]
                                  | readonly Uint8Array[]
                                  | undefined;
                                blobVersionedHashes?:
                                  | readonly `0x${string}`[]
                                  | undefined;
                                maxFeePerBlobGas?: bigint | undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?:
                                  | false
                                  | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                  | undefined;
                              } & (import('viem').ExactPartial<
                                import('viem').FeeValuesEIP4844
                              > &
                                import('viem').OneOf<
                                  | {
                                      blobs:
                                        | readonly `0x${string}`[]
                                        | readonly Uint8Array[]
                                        | undefined;
                                    }
                                  | {
                                      blobVersionedHashes:
                                        | readonly `0x${string}`[]
                                        | undefined;
                                    }
                                  | {
                                      sidecars:
                                        | false
                                        | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                        | undefined;
                                    },
                                  import('viem').TransactionSerializableEIP4844
                                >))
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'blobVersionedHashes'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    | 'blobs'
                                    | 'kzg'
                                    | 'sidecars'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP4844
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'from'
                                    | 'gas'
                                    | 'nonce'
                                    | 'to'
                                    | 'value'
                                    | 'accessList'
                                    | 'blobVersionedHashes'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    | 'blobs'
                                    | 'kzg'
                                    | 'sidecars'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP4844
                                : never)
                            ? 'eip4844'
                            : never)
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?:
                                  | import('viem/experimental').SignedAuthorizationList
                                  | undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').ExactPartial<
                                import('viem').FeeValuesEIP1559
                              > & {
                                  authorizationList: import('viem/experimental').SignedAuthorizationList;
                                })
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'authorizationList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP7702
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | 'authorizationList'
                                    | keyof import('viem').FeeValuesEIP1559<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip7702'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP7702
                                : never)
                            ? 'eip7702'
                            : never)
                        | (request['type'] extends string | undefined
                            ? Extract<request['type'], string>
                            : never)
                      >
              ) extends 'eip4844'
                ? import('viem').TransactionRequestEIP4844
                : never)
            | ((
                request['type'] extends string | undefined
                  ? request['type']
                  : import('viem').GetTransactionType<
                        request,
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').FeeValuesLegacy)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableLegacy
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | keyof import('viem').FeeValuesLegacy<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'legacy'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestLegacy
                                : never)
                            ? 'legacy'
                            : never)
                        | (request extends
                            | ({
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: undefined;
                                maxFeePerBlobGas?: undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?: undefined;
                              } & (import('viem').OneOf<
                                | {maxFeePerGas: bigint}
                                | {maxPriorityFeePerGas: bigint},
                                import('viem').FeeValuesEIP1559
                              > & {
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                              }))
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP1559
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | keyof import('viem').FeeValuesEIP1559<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip1559'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP1559
                                : never)
                            ? 'eip1559'
                            : never)
                        | (request extends
                            | ({
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').ExactPartial<
                                import('viem').FeeValuesLegacy
                              > & {
                                  accessList:
                                    | import('viem').AccessList
                                    | undefined;
                                })
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP2930
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | keyof import('viem').FeeValuesLegacy<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip2930'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP2930
                                : never)
                            ? 'eip2930'
                            : never)
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?: undefined;
                                blobs?:
                                  | readonly `0x${string}`[]
                                  | readonly Uint8Array[]
                                  | undefined;
                                blobVersionedHashes?:
                                  | readonly `0x${string}`[]
                                  | undefined;
                                maxFeePerBlobGas?: bigint | undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?:
                                  | false
                                  | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                  | undefined;
                              } & (import('viem').ExactPartial<
                                import('viem').FeeValuesEIP4844
                              > &
                                import('viem').OneOf<
                                  | {
                                      blobs:
                                        | readonly `0x${string}`[]
                                        | readonly Uint8Array[]
                                        | undefined;
                                    }
                                  | {
                                      blobVersionedHashes:
                                        | readonly `0x${string}`[]
                                        | undefined;
                                    }
                                  | {
                                      sidecars:
                                        | false
                                        | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                        | undefined;
                                    },
                                  import('viem').TransactionSerializableEIP4844
                                >))
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'blobVersionedHashes'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    | 'blobs'
                                    | 'kzg'
                                    | 'sidecars'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP4844
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'from'
                                    | 'gas'
                                    | 'nonce'
                                    | 'to'
                                    | 'value'
                                    | 'accessList'
                                    | 'blobVersionedHashes'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    | 'blobs'
                                    | 'kzg'
                                    | 'sidecars'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP4844
                                : never)
                            ? 'eip4844'
                            : never)
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?:
                                  | import('viem/experimental').SignedAuthorizationList
                                  | undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').ExactPartial<
                                import('viem').FeeValuesEIP1559
                              > & {
                                  authorizationList: import('viem/experimental').SignedAuthorizationList;
                                })
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'authorizationList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP7702
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | 'authorizationList'
                                    | keyof import('viem').FeeValuesEIP1559<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip7702'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP7702
                                : never)
                            ? 'eip7702'
                            : never)
                        | (request['type'] extends string | undefined
                            ? Extract<request['type'], string>
                            : never)
                      > extends 'legacy'
                    ? unknown
                    : import('viem').GetTransactionType<
                        request,
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').FeeValuesLegacy)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableLegacy
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | keyof import('viem').FeeValuesLegacy<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'legacy'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestLegacy
                                : never)
                            ? 'legacy'
                            : never)
                        | (request extends
                            | ({
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: undefined;
                                maxFeePerBlobGas?: undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?: undefined;
                              } & (import('viem').OneOf<
                                | {maxFeePerGas: bigint}
                                | {maxPriorityFeePerGas: bigint},
                                import('viem').FeeValuesEIP1559
                              > & {
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                              }))
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP1559
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | keyof import('viem').FeeValuesEIP1559<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip1559'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP1559
                                : never)
                            ? 'eip1559'
                            : never)
                        | (request extends
                            | ({
                                accessList?:
                                  | import('viem').AccessList
                                  | undefined;
                                authorizationList?: undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                gasPrice?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').ExactPartial<
                                import('viem').FeeValuesLegacy
                              > & {
                                  accessList:
                                    | import('viem').AccessList
                                    | undefined;
                                })
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP2930
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | keyof import('viem').FeeValuesLegacy<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip2930'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP2930
                                : never)
                            ? 'eip2930'
                            : never)
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?: undefined;
                                blobs?:
                                  | readonly `0x${string}`[]
                                  | readonly Uint8Array[]
                                  | undefined;
                                blobVersionedHashes?:
                                  | readonly `0x${string}`[]
                                  | undefined;
                                maxFeePerBlobGas?: bigint | undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?:
                                  | false
                                  | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                  | undefined;
                              } & (import('viem').ExactPartial<
                                import('viem').FeeValuesEIP4844
                              > &
                                import('viem').OneOf<
                                  | {
                                      blobs:
                                        | readonly `0x${string}`[]
                                        | readonly Uint8Array[]
                                        | undefined;
                                    }
                                  | {
                                      blobVersionedHashes:
                                        | readonly `0x${string}`[]
                                        | undefined;
                                    }
                                  | {
                                      sidecars:
                                        | false
                                        | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                        | undefined;
                                    },
                                  import('viem').TransactionSerializableEIP4844
                                >))
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'blobVersionedHashes'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    | 'blobs'
                                    | 'kzg'
                                    | 'sidecars'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP4844
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'from'
                                    | 'gas'
                                    | 'nonce'
                                    | 'to'
                                    | 'value'
                                    | 'accessList'
                                    | 'blobVersionedHashes'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    | 'blobs'
                                    | 'kzg'
                                    | 'sidecars'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP4844
                                : never)
                            ? 'eip4844'
                            : never)
                        | (request extends
                            | ({
                                accessList?: undefined;
                                authorizationList?:
                                  | import('viem/experimental').SignedAuthorizationList
                                  | undefined;
                                blobs?: undefined;
                                blobVersionedHashes?: undefined;
                                maxFeePerGas?: bigint | undefined;
                                maxPriorityFeePerGas?: bigint | undefined;
                                sidecars?: undefined;
                              } & import('viem').ExactPartial<
                                import('viem').FeeValuesEIP1559
                              > & {
                                  authorizationList: import('viem/experimental').SignedAuthorizationList;
                                })
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'yParity'
                                    | 'gas'
                                    | 'nonce'
                                    | 'r'
                                    | 's'
                                    | 'to'
                                    | 'v'
                                    | 'value'
                                    | 'accessList'
                                    | 'authorizationList'
                                    | 'chainId'
                                    | 'type'
                                    | 'gasPrice'
                                    | 'maxFeePerBlobGas'
                                    | 'maxFeePerGas'
                                    | 'maxPriorityFeePerGas'
                                    | 'data'
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionSerializableEIP7702
                                : never)
                            | (import('viem').ValueOf<
                                Required<{
                                  [K in keyof request]: K extends
                                    | 'accessList'
                                    | 'authorizationList'
                                    | keyof import('viem').FeeValuesEIP1559<bigint>
                                    | keyof import('viem').TransactionRequestBase<
                                        bigint,
                                        number,
                                        'eip7702'
                                      >
                                    ? K
                                    : undefined;
                                }>
                              > extends string
                                ? import('viem').TransactionRequestEIP7702
                                : never)
                            ? 'eip7702'
                            : never)
                        | (request['type'] extends string | undefined
                            ? Extract<request['type'], string>
                            : never)
                      >
              ) extends 'eip7702'
                ? import('viem').TransactionRequestEIP7702
                : never)
          > extends true
            ? unknown
            : import('viem').ExactPartial<
                | ((
                    request['type'] extends string | undefined
                      ? request['type']
                      : import('viem').GetTransactionType<
                            request,
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').FeeValuesLegacy)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableLegacy
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | keyof import('viem').FeeValuesLegacy<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'legacy'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestLegacy
                                    : never)
                                ? 'legacy'
                                : never)
                            | (request extends
                                | ({
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: undefined;
                                    maxFeePerBlobGas?: undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & (import('viem').OneOf<
                                    | {maxFeePerGas: bigint}
                                    | {maxPriorityFeePerGas: bigint},
                                    import('viem').FeeValuesEIP1559
                                  > & {
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                  }))
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP1559
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | keyof import('viem').FeeValuesEIP1559<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip1559'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP1559
                                    : never)
                                ? 'eip1559'
                                : never)
                            | (request extends
                                | ({
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').ExactPartial<
                                    import('viem').FeeValuesLegacy
                                  > & {
                                      accessList:
                                        | import('viem').AccessList
                                        | undefined;
                                    })
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP2930
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | keyof import('viem').FeeValuesLegacy<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip2930'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP2930
                                    : never)
                                ? 'eip2930'
                                : never)
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?: undefined;
                                    blobs?:
                                      | readonly `0x${string}`[]
                                      | readonly Uint8Array[]
                                      | undefined;
                                    blobVersionedHashes?:
                                      | readonly `0x${string}`[]
                                      | undefined;
                                    maxFeePerBlobGas?: bigint | undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?:
                                      | false
                                      | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                      | undefined;
                                  } & (import('viem').ExactPartial<
                                    import('viem').FeeValuesEIP4844
                                  > &
                                    import('viem').OneOf<
                                      | {
                                          blobs:
                                            | readonly `0x${string}`[]
                                            | readonly Uint8Array[]
                                            | undefined;
                                        }
                                      | {
                                          blobVersionedHashes:
                                            | readonly `0x${string}`[]
                                            | undefined;
                                        }
                                      | {
                                          sidecars:
                                            | false
                                            | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                            | undefined;
                                        },
                                      import('viem').TransactionSerializableEIP4844
                                    >))
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'blobVersionedHashes'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        | 'blobs'
                                        | 'kzg'
                                        | 'sidecars'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP4844
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'from'
                                        | 'gas'
                                        | 'nonce'
                                        | 'to'
                                        | 'value'
                                        | 'accessList'
                                        | 'blobVersionedHashes'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        | 'blobs'
                                        | 'kzg'
                                        | 'sidecars'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP4844
                                    : never)
                                ? 'eip4844'
                                : never)
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?:
                                      | import('viem/experimental').SignedAuthorizationList
                                      | undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').ExactPartial<
                                    import('viem').FeeValuesEIP1559
                                  > & {
                                      authorizationList: import('viem/experimental').SignedAuthorizationList;
                                    })
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'authorizationList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP7702
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | 'authorizationList'
                                        | keyof import('viem').FeeValuesEIP1559<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip7702'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP7702
                                    : never)
                                ? 'eip7702'
                                : never)
                            | (request['type'] extends string | undefined
                                ? Extract<request['type'], string>
                                : never)
                          > extends 'legacy'
                        ? unknown
                        : import('viem').GetTransactionType<
                            request,
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').FeeValuesLegacy)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableLegacy
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | keyof import('viem').FeeValuesLegacy<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'legacy'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestLegacy
                                    : never)
                                ? 'legacy'
                                : never)
                            | (request extends
                                | ({
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: undefined;
                                    maxFeePerBlobGas?: undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & (import('viem').OneOf<
                                    | {maxFeePerGas: bigint}
                                    | {maxPriorityFeePerGas: bigint},
                                    import('viem').FeeValuesEIP1559
                                  > & {
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                  }))
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP1559
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | keyof import('viem').FeeValuesEIP1559<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip1559'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP1559
                                    : never)
                                ? 'eip1559'
                                : never)
                            | (request extends
                                | ({
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').ExactPartial<
                                    import('viem').FeeValuesLegacy
                                  > & {
                                      accessList:
                                        | import('viem').AccessList
                                        | undefined;
                                    })
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP2930
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | keyof import('viem').FeeValuesLegacy<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip2930'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP2930
                                    : never)
                                ? 'eip2930'
                                : never)
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?: undefined;
                                    blobs?:
                                      | readonly `0x${string}`[]
                                      | readonly Uint8Array[]
                                      | undefined;
                                    blobVersionedHashes?:
                                      | readonly `0x${string}`[]
                                      | undefined;
                                    maxFeePerBlobGas?: bigint | undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?:
                                      | false
                                      | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                      | undefined;
                                  } & (import('viem').ExactPartial<
                                    import('viem').FeeValuesEIP4844
                                  > &
                                    import('viem').OneOf<
                                      | {
                                          blobs:
                                            | readonly `0x${string}`[]
                                            | readonly Uint8Array[]
                                            | undefined;
                                        }
                                      | {
                                          blobVersionedHashes:
                                            | readonly `0x${string}`[]
                                            | undefined;
                                        }
                                      | {
                                          sidecars:
                                            | false
                                            | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                            | undefined;
                                        },
                                      import('viem').TransactionSerializableEIP4844
                                    >))
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'blobVersionedHashes'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        | 'blobs'
                                        | 'kzg'
                                        | 'sidecars'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP4844
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'from'
                                        | 'gas'
                                        | 'nonce'
                                        | 'to'
                                        | 'value'
                                        | 'accessList'
                                        | 'blobVersionedHashes'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        | 'blobs'
                                        | 'kzg'
                                        | 'sidecars'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP4844
                                    : never)
                                ? 'eip4844'
                                : never)
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?:
                                      | import('viem/experimental').SignedAuthorizationList
                                      | undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').ExactPartial<
                                    import('viem').FeeValuesEIP1559
                                  > & {
                                      authorizationList: import('viem/experimental').SignedAuthorizationList;
                                    })
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'authorizationList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP7702
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | 'authorizationList'
                                        | keyof import('viem').FeeValuesEIP1559<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip7702'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP7702
                                    : never)
                                ? 'eip7702'
                                : never)
                            | (request['type'] extends string | undefined
                                ? Extract<request['type'], string>
                                : never)
                          >
                  ) extends 'legacy'
                    ? import('viem').TransactionRequestLegacy
                    : never)
                | ((
                    request['type'] extends string | undefined
                      ? request['type']
                      : import('viem').GetTransactionType<
                            request,
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').FeeValuesLegacy)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableLegacy
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | keyof import('viem').FeeValuesLegacy<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'legacy'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestLegacy
                                    : never)
                                ? 'legacy'
                                : never)
                            | (request extends
                                | ({
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: undefined;
                                    maxFeePerBlobGas?: undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & (import('viem').OneOf<
                                    | {maxFeePerGas: bigint}
                                    | {maxPriorityFeePerGas: bigint},
                                    import('viem').FeeValuesEIP1559
                                  > & {
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                  }))
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP1559
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | keyof import('viem').FeeValuesEIP1559<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip1559'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP1559
                                    : never)
                                ? 'eip1559'
                                : never)
                            | (request extends
                                | ({
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').ExactPartial<
                                    import('viem').FeeValuesLegacy
                                  > & {
                                      accessList:
                                        | import('viem').AccessList
                                        | undefined;
                                    })
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP2930
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | keyof import('viem').FeeValuesLegacy<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip2930'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP2930
                                    : never)
                                ? 'eip2930'
                                : never)
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?: undefined;
                                    blobs?:
                                      | readonly `0x${string}`[]
                                      | readonly Uint8Array[]
                                      | undefined;
                                    blobVersionedHashes?:
                                      | readonly `0x${string}`[]
                                      | undefined;
                                    maxFeePerBlobGas?: bigint | undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?:
                                      | false
                                      | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                      | undefined;
                                  } & (import('viem').ExactPartial<
                                    import('viem').FeeValuesEIP4844
                                  > &
                                    import('viem').OneOf<
                                      | {
                                          blobs:
                                            | readonly `0x${string}`[]
                                            | readonly Uint8Array[]
                                            | undefined;
                                        }
                                      | {
                                          blobVersionedHashes:
                                            | readonly `0x${string}`[]
                                            | undefined;
                                        }
                                      | {
                                          sidecars:
                                            | false
                                            | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                            | undefined;
                                        },
                                      import('viem').TransactionSerializableEIP4844
                                    >))
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'blobVersionedHashes'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        | 'blobs'
                                        | 'kzg'
                                        | 'sidecars'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP4844
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'from'
                                        | 'gas'
                                        | 'nonce'
                                        | 'to'
                                        | 'value'
                                        | 'accessList'
                                        | 'blobVersionedHashes'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        | 'blobs'
                                        | 'kzg'
                                        | 'sidecars'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP4844
                                    : never)
                                ? 'eip4844'
                                : never)
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?:
                                      | import('viem/experimental').SignedAuthorizationList
                                      | undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').ExactPartial<
                                    import('viem').FeeValuesEIP1559
                                  > & {
                                      authorizationList: import('viem/experimental').SignedAuthorizationList;
                                    })
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'authorizationList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP7702
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | 'authorizationList'
                                        | keyof import('viem').FeeValuesEIP1559<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip7702'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP7702
                                    : never)
                                ? 'eip7702'
                                : never)
                            | (request['type'] extends string | undefined
                                ? Extract<request['type'], string>
                                : never)
                          > extends 'legacy'
                        ? unknown
                        : import('viem').GetTransactionType<
                            request,
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').FeeValuesLegacy)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableLegacy
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | keyof import('viem').FeeValuesLegacy<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'legacy'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestLegacy
                                    : never)
                                ? 'legacy'
                                : never)
                            | (request extends
                                | ({
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: undefined;
                                    maxFeePerBlobGas?: undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & (import('viem').OneOf<
                                    | {maxFeePerGas: bigint}
                                    | {maxPriorityFeePerGas: bigint},
                                    import('viem').FeeValuesEIP1559
                                  > & {
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                  }))
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP1559
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | keyof import('viem').FeeValuesEIP1559<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip1559'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP1559
                                    : never)
                                ? 'eip1559'
                                : never)
                            | (request extends
                                | ({
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').ExactPartial<
                                    import('viem').FeeValuesLegacy
                                  > & {
                                      accessList:
                                        | import('viem').AccessList
                                        | undefined;
                                    })
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP2930
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | keyof import('viem').FeeValuesLegacy<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip2930'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP2930
                                    : never)
                                ? 'eip2930'
                                : never)
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?: undefined;
                                    blobs?:
                                      | readonly `0x${string}`[]
                                      | readonly Uint8Array[]
                                      | undefined;
                                    blobVersionedHashes?:
                                      | readonly `0x${string}`[]
                                      | undefined;
                                    maxFeePerBlobGas?: bigint | undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?:
                                      | false
                                      | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                      | undefined;
                                  } & (import('viem').ExactPartial<
                                    import('viem').FeeValuesEIP4844
                                  > &
                                    import('viem').OneOf<
                                      | {
                                          blobs:
                                            | readonly `0x${string}`[]
                                            | readonly Uint8Array[]
                                            | undefined;
                                        }
                                      | {
                                          blobVersionedHashes:
                                            | readonly `0x${string}`[]
                                            | undefined;
                                        }
                                      | {
                                          sidecars:
                                            | false
                                            | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                            | undefined;
                                        },
                                      import('viem').TransactionSerializableEIP4844
                                    >))
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'blobVersionedHashes'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        | 'blobs'
                                        | 'kzg'
                                        | 'sidecars'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP4844
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'from'
                                        | 'gas'
                                        | 'nonce'
                                        | 'to'
                                        | 'value'
                                        | 'accessList'
                                        | 'blobVersionedHashes'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        | 'blobs'
                                        | 'kzg'
                                        | 'sidecars'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP4844
                                    : never)
                                ? 'eip4844'
                                : never)
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?:
                                      | import('viem/experimental').SignedAuthorizationList
                                      | undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').ExactPartial<
                                    import('viem').FeeValuesEIP1559
                                  > & {
                                      authorizationList: import('viem/experimental').SignedAuthorizationList;
                                    })
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'authorizationList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP7702
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | 'authorizationList'
                                        | keyof import('viem').FeeValuesEIP1559<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip7702'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP7702
                                    : never)
                                ? 'eip7702'
                                : never)
                            | (request['type'] extends string | undefined
                                ? Extract<request['type'], string>
                                : never)
                          >
                  ) extends 'eip1559'
                    ? import('viem').TransactionRequestEIP1559
                    : never)
                | ((
                    request['type'] extends string | undefined
                      ? request['type']
                      : import('viem').GetTransactionType<
                            request,
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').FeeValuesLegacy)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableLegacy
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | keyof import('viem').FeeValuesLegacy<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'legacy'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestLegacy
                                    : never)
                                ? 'legacy'
                                : never)
                            | (request extends
                                | ({
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: undefined;
                                    maxFeePerBlobGas?: undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & (import('viem').OneOf<
                                    | {maxFeePerGas: bigint}
                                    | {maxPriorityFeePerGas: bigint},
                                    import('viem').FeeValuesEIP1559
                                  > & {
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                  }))
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP1559
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | keyof import('viem').FeeValuesEIP1559<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip1559'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP1559
                                    : never)
                                ? 'eip1559'
                                : never)
                            | (request extends
                                | ({
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').ExactPartial<
                                    import('viem').FeeValuesLegacy
                                  > & {
                                      accessList:
                                        | import('viem').AccessList
                                        | undefined;
                                    })
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP2930
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | keyof import('viem').FeeValuesLegacy<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip2930'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP2930
                                    : never)
                                ? 'eip2930'
                                : never)
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?: undefined;
                                    blobs?:
                                      | readonly `0x${string}`[]
                                      | readonly Uint8Array[]
                                      | undefined;
                                    blobVersionedHashes?:
                                      | readonly `0x${string}`[]
                                      | undefined;
                                    maxFeePerBlobGas?: bigint | undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?:
                                      | false
                                      | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                      | undefined;
                                  } & (import('viem').ExactPartial<
                                    import('viem').FeeValuesEIP4844
                                  > &
                                    import('viem').OneOf<
                                      | {
                                          blobs:
                                            | readonly `0x${string}`[]
                                            | readonly Uint8Array[]
                                            | undefined;
                                        }
                                      | {
                                          blobVersionedHashes:
                                            | readonly `0x${string}`[]
                                            | undefined;
                                        }
                                      | {
                                          sidecars:
                                            | false
                                            | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                            | undefined;
                                        },
                                      import('viem').TransactionSerializableEIP4844
                                    >))
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'blobVersionedHashes'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        | 'blobs'
                                        | 'kzg'
                                        | 'sidecars'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP4844
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'from'
                                        | 'gas'
                                        | 'nonce'
                                        | 'to'
                                        | 'value'
                                        | 'accessList'
                                        | 'blobVersionedHashes'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        | 'blobs'
                                        | 'kzg'
                                        | 'sidecars'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP4844
                                    : never)
                                ? 'eip4844'
                                : never)
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?:
                                      | import('viem/experimental').SignedAuthorizationList
                                      | undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').ExactPartial<
                                    import('viem').FeeValuesEIP1559
                                  > & {
                                      authorizationList: import('viem/experimental').SignedAuthorizationList;
                                    })
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'authorizationList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP7702
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | 'authorizationList'
                                        | keyof import('viem').FeeValuesEIP1559<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip7702'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP7702
                                    : never)
                                ? 'eip7702'
                                : never)
                            | (request['type'] extends string | undefined
                                ? Extract<request['type'], string>
                                : never)
                          > extends 'legacy'
                        ? unknown
                        : import('viem').GetTransactionType<
                            request,
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').FeeValuesLegacy)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableLegacy
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | keyof import('viem').FeeValuesLegacy<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'legacy'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestLegacy
                                    : never)
                                ? 'legacy'
                                : never)
                            | (request extends
                                | ({
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: undefined;
                                    maxFeePerBlobGas?: undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & (import('viem').OneOf<
                                    | {maxFeePerGas: bigint}
                                    | {maxPriorityFeePerGas: bigint},
                                    import('viem').FeeValuesEIP1559
                                  > & {
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                  }))
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP1559
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | keyof import('viem').FeeValuesEIP1559<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip1559'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP1559
                                    : never)
                                ? 'eip1559'
                                : never)
                            | (request extends
                                | ({
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').ExactPartial<
                                    import('viem').FeeValuesLegacy
                                  > & {
                                      accessList:
                                        | import('viem').AccessList
                                        | undefined;
                                    })
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP2930
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | keyof import('viem').FeeValuesLegacy<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip2930'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP2930
                                    : never)
                                ? 'eip2930'
                                : never)
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?: undefined;
                                    blobs?:
                                      | readonly `0x${string}`[]
                                      | readonly Uint8Array[]
                                      | undefined;
                                    blobVersionedHashes?:
                                      | readonly `0x${string}`[]
                                      | undefined;
                                    maxFeePerBlobGas?: bigint | undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?:
                                      | false
                                      | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                      | undefined;
                                  } & (import('viem').ExactPartial<
                                    import('viem').FeeValuesEIP4844
                                  > &
                                    import('viem').OneOf<
                                      | {
                                          blobs:
                                            | readonly `0x${string}`[]
                                            | readonly Uint8Array[]
                                            | undefined;
                                        }
                                      | {
                                          blobVersionedHashes:
                                            | readonly `0x${string}`[]
                                            | undefined;
                                        }
                                      | {
                                          sidecars:
                                            | false
                                            | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                            | undefined;
                                        },
                                      import('viem').TransactionSerializableEIP4844
                                    >))
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'blobVersionedHashes'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        | 'blobs'
                                        | 'kzg'
                                        | 'sidecars'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP4844
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'from'
                                        | 'gas'
                                        | 'nonce'
                                        | 'to'
                                        | 'value'
                                        | 'accessList'
                                        | 'blobVersionedHashes'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        | 'blobs'
                                        | 'kzg'
                                        | 'sidecars'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP4844
                                    : never)
                                ? 'eip4844'
                                : never)
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?:
                                      | import('viem/experimental').SignedAuthorizationList
                                      | undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').ExactPartial<
                                    import('viem').FeeValuesEIP1559
                                  > & {
                                      authorizationList: import('viem/experimental').SignedAuthorizationList;
                                    })
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'authorizationList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP7702
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | 'authorizationList'
                                        | keyof import('viem').FeeValuesEIP1559<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip7702'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP7702
                                    : never)
                                ? 'eip7702'
                                : never)
                            | (request['type'] extends string | undefined
                                ? Extract<request['type'], string>
                                : never)
                          >
                  ) extends 'eip2930'
                    ? import('viem').TransactionRequestEIP2930
                    : never)
                | ((
                    request['type'] extends string | undefined
                      ? request['type']
                      : import('viem').GetTransactionType<
                            request,
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').FeeValuesLegacy)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableLegacy
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | keyof import('viem').FeeValuesLegacy<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'legacy'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestLegacy
                                    : never)
                                ? 'legacy'
                                : never)
                            | (request extends
                                | ({
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: undefined;
                                    maxFeePerBlobGas?: undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & (import('viem').OneOf<
                                    | {maxFeePerGas: bigint}
                                    | {maxPriorityFeePerGas: bigint},
                                    import('viem').FeeValuesEIP1559
                                  > & {
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                  }))
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP1559
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | keyof import('viem').FeeValuesEIP1559<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip1559'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP1559
                                    : never)
                                ? 'eip1559'
                                : never)
                            | (request extends
                                | ({
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').ExactPartial<
                                    import('viem').FeeValuesLegacy
                                  > & {
                                      accessList:
                                        | import('viem').AccessList
                                        | undefined;
                                    })
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP2930
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | keyof import('viem').FeeValuesLegacy<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip2930'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP2930
                                    : never)
                                ? 'eip2930'
                                : never)
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?: undefined;
                                    blobs?:
                                      | readonly `0x${string}`[]
                                      | readonly Uint8Array[]
                                      | undefined;
                                    blobVersionedHashes?:
                                      | readonly `0x${string}`[]
                                      | undefined;
                                    maxFeePerBlobGas?: bigint | undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?:
                                      | false
                                      | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                      | undefined;
                                  } & (import('viem').ExactPartial<
                                    import('viem').FeeValuesEIP4844
                                  > &
                                    import('viem').OneOf<
                                      | {
                                          blobs:
                                            | readonly `0x${string}`[]
                                            | readonly Uint8Array[]
                                            | undefined;
                                        }
                                      | {
                                          blobVersionedHashes:
                                            | readonly `0x${string}`[]
                                            | undefined;
                                        }
                                      | {
                                          sidecars:
                                            | false
                                            | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                            | undefined;
                                        },
                                      import('viem').TransactionSerializableEIP4844
                                    >))
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'blobVersionedHashes'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        | 'blobs'
                                        | 'kzg'
                                        | 'sidecars'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP4844
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'from'
                                        | 'gas'
                                        | 'nonce'
                                        | 'to'
                                        | 'value'
                                        | 'accessList'
                                        | 'blobVersionedHashes'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        | 'blobs'
                                        | 'kzg'
                                        | 'sidecars'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP4844
                                    : never)
                                ? 'eip4844'
                                : never)
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?:
                                      | import('viem/experimental').SignedAuthorizationList
                                      | undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').ExactPartial<
                                    import('viem').FeeValuesEIP1559
                                  > & {
                                      authorizationList: import('viem/experimental').SignedAuthorizationList;
                                    })
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'authorizationList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP7702
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | 'authorizationList'
                                        | keyof import('viem').FeeValuesEIP1559<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip7702'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP7702
                                    : never)
                                ? 'eip7702'
                                : never)
                            | (request['type'] extends string | undefined
                                ? Extract<request['type'], string>
                                : never)
                          > extends 'legacy'
                        ? unknown
                        : import('viem').GetTransactionType<
                            request,
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').FeeValuesLegacy)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableLegacy
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | keyof import('viem').FeeValuesLegacy<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'legacy'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestLegacy
                                    : never)
                                ? 'legacy'
                                : never)
                            | (request extends
                                | ({
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: undefined;
                                    maxFeePerBlobGas?: undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & (import('viem').OneOf<
                                    | {maxFeePerGas: bigint}
                                    | {maxPriorityFeePerGas: bigint},
                                    import('viem').FeeValuesEIP1559
                                  > & {
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                  }))
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP1559
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | keyof import('viem').FeeValuesEIP1559<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip1559'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP1559
                                    : never)
                                ? 'eip1559'
                                : never)
                            | (request extends
                                | ({
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').ExactPartial<
                                    import('viem').FeeValuesLegacy
                                  > & {
                                      accessList:
                                        | import('viem').AccessList
                                        | undefined;
                                    })
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP2930
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | keyof import('viem').FeeValuesLegacy<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip2930'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP2930
                                    : never)
                                ? 'eip2930'
                                : never)
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?: undefined;
                                    blobs?:
                                      | readonly `0x${string}`[]
                                      | readonly Uint8Array[]
                                      | undefined;
                                    blobVersionedHashes?:
                                      | readonly `0x${string}`[]
                                      | undefined;
                                    maxFeePerBlobGas?: bigint | undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?:
                                      | false
                                      | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                      | undefined;
                                  } & (import('viem').ExactPartial<
                                    import('viem').FeeValuesEIP4844
                                  > &
                                    import('viem').OneOf<
                                      | {
                                          blobs:
                                            | readonly `0x${string}`[]
                                            | readonly Uint8Array[]
                                            | undefined;
                                        }
                                      | {
                                          blobVersionedHashes:
                                            | readonly `0x${string}`[]
                                            | undefined;
                                        }
                                      | {
                                          sidecars:
                                            | false
                                            | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                            | undefined;
                                        },
                                      import('viem').TransactionSerializableEIP4844
                                    >))
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'blobVersionedHashes'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        | 'blobs'
                                        | 'kzg'
                                        | 'sidecars'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP4844
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'from'
                                        | 'gas'
                                        | 'nonce'
                                        | 'to'
                                        | 'value'
                                        | 'accessList'
                                        | 'blobVersionedHashes'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        | 'blobs'
                                        | 'kzg'
                                        | 'sidecars'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP4844
                                    : never)
                                ? 'eip4844'
                                : never)
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?:
                                      | import('viem/experimental').SignedAuthorizationList
                                      | undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').ExactPartial<
                                    import('viem').FeeValuesEIP1559
                                  > & {
                                      authorizationList: import('viem/experimental').SignedAuthorizationList;
                                    })
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'authorizationList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP7702
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | 'authorizationList'
                                        | keyof import('viem').FeeValuesEIP1559<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip7702'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP7702
                                    : never)
                                ? 'eip7702'
                                : never)
                            | (request['type'] extends string | undefined
                                ? Extract<request['type'], string>
                                : never)
                          >
                  ) extends 'eip4844'
                    ? import('viem').TransactionRequestEIP4844
                    : never)
                | ((
                    request['type'] extends string | undefined
                      ? request['type']
                      : import('viem').GetTransactionType<
                            request,
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').FeeValuesLegacy)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableLegacy
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | keyof import('viem').FeeValuesLegacy<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'legacy'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestLegacy
                                    : never)
                                ? 'legacy'
                                : never)
                            | (request extends
                                | ({
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: undefined;
                                    maxFeePerBlobGas?: undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & (import('viem').OneOf<
                                    | {maxFeePerGas: bigint}
                                    | {maxPriorityFeePerGas: bigint},
                                    import('viem').FeeValuesEIP1559
                                  > & {
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                  }))
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP1559
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | keyof import('viem').FeeValuesEIP1559<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip1559'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP1559
                                    : never)
                                ? 'eip1559'
                                : never)
                            | (request extends
                                | ({
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').ExactPartial<
                                    import('viem').FeeValuesLegacy
                                  > & {
                                      accessList:
                                        | import('viem').AccessList
                                        | undefined;
                                    })
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP2930
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | keyof import('viem').FeeValuesLegacy<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip2930'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP2930
                                    : never)
                                ? 'eip2930'
                                : never)
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?: undefined;
                                    blobs?:
                                      | readonly `0x${string}`[]
                                      | readonly Uint8Array[]
                                      | undefined;
                                    blobVersionedHashes?:
                                      | readonly `0x${string}`[]
                                      | undefined;
                                    maxFeePerBlobGas?: bigint | undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?:
                                      | false
                                      | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                      | undefined;
                                  } & (import('viem').ExactPartial<
                                    import('viem').FeeValuesEIP4844
                                  > &
                                    import('viem').OneOf<
                                      | {
                                          blobs:
                                            | readonly `0x${string}`[]
                                            | readonly Uint8Array[]
                                            | undefined;
                                        }
                                      | {
                                          blobVersionedHashes:
                                            | readonly `0x${string}`[]
                                            | undefined;
                                        }
                                      | {
                                          sidecars:
                                            | false
                                            | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                            | undefined;
                                        },
                                      import('viem').TransactionSerializableEIP4844
                                    >))
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'blobVersionedHashes'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        | 'blobs'
                                        | 'kzg'
                                        | 'sidecars'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP4844
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'from'
                                        | 'gas'
                                        | 'nonce'
                                        | 'to'
                                        | 'value'
                                        | 'accessList'
                                        | 'blobVersionedHashes'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        | 'blobs'
                                        | 'kzg'
                                        | 'sidecars'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP4844
                                    : never)
                                ? 'eip4844'
                                : never)
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?:
                                      | import('viem/experimental').SignedAuthorizationList
                                      | undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').ExactPartial<
                                    import('viem').FeeValuesEIP1559
                                  > & {
                                      authorizationList: import('viem/experimental').SignedAuthorizationList;
                                    })
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'authorizationList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP7702
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | 'authorizationList'
                                        | keyof import('viem').FeeValuesEIP1559<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip7702'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP7702
                                    : never)
                                ? 'eip7702'
                                : never)
                            | (request['type'] extends string | undefined
                                ? Extract<request['type'], string>
                                : never)
                          > extends 'legacy'
                        ? unknown
                        : import('viem').GetTransactionType<
                            request,
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').FeeValuesLegacy)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableLegacy
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | keyof import('viem').FeeValuesLegacy<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'legacy'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestLegacy
                                    : never)
                                ? 'legacy'
                                : never)
                            | (request extends
                                | ({
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: undefined;
                                    maxFeePerBlobGas?: undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & (import('viem').OneOf<
                                    | {maxFeePerGas: bigint}
                                    | {maxPriorityFeePerGas: bigint},
                                    import('viem').FeeValuesEIP1559
                                  > & {
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                  }))
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP1559
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | keyof import('viem').FeeValuesEIP1559<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip1559'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP1559
                                    : never)
                                ? 'eip1559'
                                : never)
                            | (request extends
                                | ({
                                    accessList?:
                                      | import('viem').AccessList
                                      | undefined;
                                    authorizationList?: undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    gasPrice?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').ExactPartial<
                                    import('viem').FeeValuesLegacy
                                  > & {
                                      accessList:
                                        | import('viem').AccessList
                                        | undefined;
                                    })
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP2930
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | keyof import('viem').FeeValuesLegacy<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip2930'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP2930
                                    : never)
                                ? 'eip2930'
                                : never)
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?: undefined;
                                    blobs?:
                                      | readonly `0x${string}`[]
                                      | readonly Uint8Array[]
                                      | undefined;
                                    blobVersionedHashes?:
                                      | readonly `0x${string}`[]
                                      | undefined;
                                    maxFeePerBlobGas?: bigint | undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?:
                                      | false
                                      | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                      | undefined;
                                  } & (import('viem').ExactPartial<
                                    import('viem').FeeValuesEIP4844
                                  > &
                                    import('viem').OneOf<
                                      | {
                                          blobs:
                                            | readonly `0x${string}`[]
                                            | readonly Uint8Array[]
                                            | undefined;
                                        }
                                      | {
                                          blobVersionedHashes:
                                            | readonly `0x${string}`[]
                                            | undefined;
                                        }
                                      | {
                                          sidecars:
                                            | false
                                            | readonly import('viem').BlobSidecar<`0x${string}`>[]
                                            | undefined;
                                        },
                                      import('viem').TransactionSerializableEIP4844
                                    >))
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'blobVersionedHashes'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        | 'blobs'
                                        | 'kzg'
                                        | 'sidecars'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP4844
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'from'
                                        | 'gas'
                                        | 'nonce'
                                        | 'to'
                                        | 'value'
                                        | 'accessList'
                                        | 'blobVersionedHashes'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        | 'blobs'
                                        | 'kzg'
                                        | 'sidecars'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP4844
                                    : never)
                                ? 'eip4844'
                                : never)
                            | (request extends
                                | ({
                                    accessList?: undefined;
                                    authorizationList?:
                                      | import('viem/experimental').SignedAuthorizationList
                                      | undefined;
                                    blobs?: undefined;
                                    blobVersionedHashes?: undefined;
                                    maxFeePerGas?: bigint | undefined;
                                    maxPriorityFeePerGas?: bigint | undefined;
                                    sidecars?: undefined;
                                  } & import('viem').ExactPartial<
                                    import('viem').FeeValuesEIP1559
                                  > & {
                                      authorizationList: import('viem/experimental').SignedAuthorizationList;
                                    })
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'yParity'
                                        | 'gas'
                                        | 'nonce'
                                        | 'r'
                                        | 's'
                                        | 'to'
                                        | 'v'
                                        | 'value'
                                        | 'accessList'
                                        | 'authorizationList'
                                        | 'chainId'
                                        | 'type'
                                        | 'gasPrice'
                                        | 'maxFeePerBlobGas'
                                        | 'maxFeePerGas'
                                        | 'maxPriorityFeePerGas'
                                        | 'data'
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionSerializableEIP7702
                                    : never)
                                | (import('viem').ValueOf<
                                    Required<{
                                      [K in keyof request]: K extends
                                        | 'accessList'
                                        | 'authorizationList'
                                        | keyof import('viem').FeeValuesEIP1559<bigint>
                                        | keyof import('viem').TransactionRequestBase<
                                            bigint,
                                            number,
                                            'eip7702'
                                          >
                                        ? K
                                        : undefined;
                                    }>
                                  > extends string
                                    ? import('viem').TransactionRequestEIP7702
                                    : never)
                                ? 'eip7702'
                                : never)
                            | (request['type'] extends string | undefined
                                ? Extract<request['type'], string>
                                : never)
                          >
                  ) extends 'eip7702'
                    ? import('viem').TransactionRequestEIP7702
                    : never)
              >
        > & {chainId?: number | undefined},
        (
          request['parameters'] extends readonly import('viem').PrepareTransactionRequestParameterType[]
            ? request['parameters'][number]
            :
                | 'fees'
                | 'gas'
                | 'nonce'
                | 'blobVersionedHashes'
                | 'chainId'
                | 'type'
        ) extends 'fees'
          ? 'gasPrice' | 'maxFeePerGas' | 'maxPriorityFeePerGas'
          : request['parameters'] extends readonly import('viem').PrepareTransactionRequestParameterType[]
            ? request['parameters'][number]
            :
                | 'fees'
                | 'gas'
                | 'nonce'
                | 'blobVersionedHashes'
                | 'chainId'
                | 'type'
      > &
        (unknown extends request['kzg'] ? {} : Pick<request, 'kzg'>))[K];
    }>;
    readContract: <
      const abi extends Abi | readonly unknown[],
      functionName extends import('viem').ContractFunctionName<
        abi,
        'pure' | 'view'
      >,
      args extends import('viem').ContractFunctionArgs<
        abi,
        'pure' | 'view',
        functionName
      >,
    >(
      args: import('viem').ReadContractParameters<abi, functionName, args>,
    ) => Promise<
      import('viem').ReadContractReturnType<abi, functionName, args>
    >;
    sendRawTransaction: (
      args: import('viem').SendRawTransactionParameters,
    ) => Promise<`0x${string}`>;
    simulateContract: <
      const abi extends Abi | readonly unknown[],
      functionName extends import('viem').ContractFunctionName<
        abi,
        'nonpayable' | 'payable'
      >,
      args extends import('viem').ContractFunctionArgs<
        abi,
        'nonpayable' | 'payable',
        functionName
      >,
      chainOverride extends import('viem').Chain | undefined,
      accountOverride extends
        | `0x${string}`
        | import('viem').Account
        | undefined = undefined,
    >(
      args: import('viem').SimulateContractParameters<
        abi,
        functionName,
        args,
        {
          blockExplorers: {
            readonly default: {
              readonly name: 'Arbiscan';
              readonly url: 'https://arbiscan.io';
              readonly apiUrl: 'https://api.arbiscan.io/api';
            };
          };
          contracts: {
            readonly multicall3: {
              readonly address: '0xca11bde05977b3631167028862be2a173976ca11';
              readonly blockCreated: 7654707;
            };
          };
          id: 42161;
          name: 'Arbitrum One';
          nativeCurrency: {
            readonly name: 'Ether';
            readonly symbol: 'ETH';
            readonly decimals: 18;
          };
          rpcUrls: {
            readonly default: {
              readonly http: readonly ['https://arb1.arbitrum.io/rpc'];
            };
          };
          sourceId?: number | undefined;
          testnet?: boolean | undefined;
          custom?: Record<string, unknown> | undefined;
          fees?: import('viem').ChainFees<undefined> | undefined;
          formatters?: undefined;
          serializers?:
            | import('viem').ChainSerializers<
                undefined,
                import('viem').TransactionSerializable<bigint, number>
              >
            | undefined;
        },
        chainOverride,
        accountOverride
      >,
    ) => Promise<
      import('viem').SimulateContractReturnType<
        abi,
        functionName,
        args,
        {
          blockExplorers: {
            readonly default: {
              readonly name: 'Arbiscan';
              readonly url: 'https://arbiscan.io';
              readonly apiUrl: 'https://api.arbiscan.io/api';
            };
          };
          contracts: {
            readonly multicall3: {
              readonly address: '0xca11bde05977b3631167028862be2a173976ca11';
              readonly blockCreated: 7654707;
            };
          };
          id: 42161;
          name: 'Arbitrum One';
          nativeCurrency: {
            readonly name: 'Ether';
            readonly symbol: 'ETH';
            readonly decimals: 18;
          };
          rpcUrls: {
            readonly default: {
              readonly http: readonly ['https://arb1.arbitrum.io/rpc'];
            };
          };
          sourceId?: number | undefined;
          testnet?: boolean | undefined;
          custom?: Record<string, unknown> | undefined;
          fees?: import('viem').ChainFees<undefined> | undefined;
          formatters?: undefined;
          serializers?:
            | import('viem').ChainSerializers<
                undefined,
                import('viem').TransactionSerializable<bigint, number>
              >
            | undefined;
        },
        import('viem').Account | undefined,
        chainOverride,
        accountOverride
      >
    >;
    verifyMessage: (args: {
      blockNumber?: bigint | undefined;
      address: `0x${string}`;
      blockTag?: import('viem').BlockTag | undefined;
      factory?: `0x${string}` | undefined;
      factoryData?: `0x${string}` | undefined;
      signature: `0x${string}` | import('viem').Signature | Uint8Array;
      message: import('viem').SignableMessage;
    }) => Promise<boolean>;
    verifySiweMessage: (args: {
      blockNumber?: bigint | undefined;
      blockTag?: import('viem').BlockTag | undefined;
      nonce?: string | undefined;
      address?: `0x${string}` | undefined;
      domain?: string | undefined;
      scheme?: string | undefined;
      time?: Date | undefined;
      message: string;
      signature: `0x${string}`;
    }) => Promise<boolean>;
    verifyTypedData: (
      args: import('viem').VerifyTypedDataActionParameters,
    ) => Promise<boolean>;
    uninstallFilter: (
      args: import('viem').UninstallFilterParameters,
    ) => Promise<boolean>;
    waitForTransactionReceipt: (
      args: import('viem').WaitForTransactionReceiptParameters<{
        blockExplorers: {
          readonly default: {
            readonly name: 'Arbiscan';
            readonly url: 'https://arbiscan.io';
            readonly apiUrl: 'https://api.arbiscan.io/api';
          };
        };
        contracts: {
          readonly multicall3: {
            readonly address: '0xca11bde05977b3631167028862be2a173976ca11';
            readonly blockCreated: 7654707;
          };
        };
        id: 42161;
        name: 'Arbitrum One';
        nativeCurrency: {
          readonly name: 'Ether';
          readonly symbol: 'ETH';
          readonly decimals: 18;
        };
        rpcUrls: {
          readonly default: {
            readonly http: readonly ['https://arb1.arbitrum.io/rpc'];
          };
        };
        sourceId?: number | undefined;
        testnet?: boolean | undefined;
        custom?: Record<string, unknown> | undefined;
        fees?: import('viem').ChainFees<undefined> | undefined;
        formatters?: undefined;
        serializers?:
          | import('viem').ChainSerializers<
              undefined,
              import('viem').TransactionSerializable<bigint, number>
            >
          | undefined;
      }>,
    ) => Promise<import('viem').TransactionReceipt>;
    watchBlockNumber: (
      args: import('viem').WatchBlockNumberParameters,
    ) => import('viem').WatchBlockNumberReturnType;
    watchBlocks: <
      includeTransactions extends boolean = false,
      blockTag extends import('viem').BlockTag = 'latest',
    >(
      args: import('viem').WatchBlocksParameters<
        import('viem').HttpTransport,
        {
          blockExplorers: {
            readonly default: {
              readonly name: 'Arbiscan';
              readonly url: 'https://arbiscan.io';
              readonly apiUrl: 'https://api.arbiscan.io/api';
            };
          };
          contracts: {
            readonly multicall3: {
              readonly address: '0xca11bde05977b3631167028862be2a173976ca11';
              readonly blockCreated: 7654707;
            };
          };
          id: 42161;
          name: 'Arbitrum One';
          nativeCurrency: {
            readonly name: 'Ether';
            readonly symbol: 'ETH';
            readonly decimals: 18;
          };
          rpcUrls: {
            readonly default: {
              readonly http: readonly ['https://arb1.arbitrum.io/rpc'];
            };
          };
          sourceId?: number | undefined;
          testnet?: boolean | undefined;
          custom?: Record<string, unknown> | undefined;
          fees?: import('viem').ChainFees<undefined> | undefined;
          formatters?: undefined;
          serializers?:
            | import('viem').ChainSerializers<
                undefined,
                import('viem').TransactionSerializable<bigint, number>
              >
            | undefined;
        },
        includeTransactions,
        blockTag
      >,
    ) => import('viem').WatchBlocksReturnType;
    watchContractEvent: <
      const abi extends Abi | readonly unknown[],
      eventName extends import('viem').ContractEventName<abi>,
      strict extends boolean | undefined = undefined,
    >(
      args: import('viem').WatchContractEventParameters<
        abi,
        eventName,
        strict,
        import('viem').HttpTransport
      >,
    ) => import('viem').WatchContractEventReturnType;
    watchEvent: <
      const abiEvent extends import('viem').AbiEvent | undefined = undefined,
      const abiEvents extends
        | readonly unknown[]
        | readonly import('viem').AbiEvent[]
        | undefined = abiEvent extends import('viem').AbiEvent
        ? [abiEvent]
        : undefined,
      strict extends boolean | undefined = undefined,
    >(
      args: import('viem').WatchEventParameters<
        abiEvent,
        abiEvents,
        strict,
        import('viem').HttpTransport
      >,
    ) => import('viem').WatchEventReturnType;
    watchPendingTransactions: (
      args: import('viem').WatchPendingTransactionsParameters<
        import('viem').HttpTransport
      >,
    ) => import('viem').WatchPendingTransactionsReturnType;
    extend: <
      const client extends {
        [x: string]: unknown;
        account?: undefined;
        batch?: undefined;
        cacheTime?: undefined;
        ccipRead?: undefined;
        chain?: undefined;
        key?: undefined;
        name?: undefined;
        pollingInterval?: undefined;
        request?: undefined;
        transport?: undefined;
        type?: undefined;
        uid?: undefined;
      } & import('viem').ExactPartial<
        Pick<
          import('viem').PublicActions<
            import('viem').HttpTransport,
            {
              blockExplorers: {
                readonly default: {
                  readonly name: 'Arbiscan';
                  readonly url: 'https://arbiscan.io';
                  readonly apiUrl: 'https://api.arbiscan.io/api';
                };
              };
              contracts: {
                readonly multicall3: {
                  readonly address: '0xca11bde05977b3631167028862be2a173976ca11';
                  readonly blockCreated: 7654707;
                };
              };
              id: 42161;
              name: 'Arbitrum One';
              nativeCurrency: {
                readonly name: 'Ether';
                readonly symbol: 'ETH';
                readonly decimals: 18;
              };
              rpcUrls: {
                readonly default: {
                  readonly http: readonly ['https://arb1.arbitrum.io/rpc'];
                };
              };
              sourceId?: number | undefined;
              testnet?: boolean | undefined;
              custom?: Record<string, unknown> | undefined;
              fees?: import('viem').ChainFees<undefined> | undefined;
              formatters?: undefined;
              serializers?:
                | import('viem').ChainSerializers<
                    undefined,
                    import('viem').TransactionSerializable<bigint, number>
                  >
                | undefined;
            },
            undefined
          >,
          | 'call'
          | 'createContractEventFilter'
          | 'createEventFilter'
          | 'estimateContractGas'
          | 'estimateGas'
          | 'getBlock'
          | 'getBlockNumber'
          | 'getChainId'
          | 'getContractEvents'
          | 'getEnsText'
          | 'getFilterChanges'
          | 'getGasPrice'
          | 'getLogs'
          | 'getTransaction'
          | 'getTransactionCount'
          | 'getTransactionReceipt'
          | 'prepareTransactionRequest'
          | 'readContract'
          | 'sendRawTransaction'
          | 'simulateContract'
          | 'uninstallFilter'
          | 'watchBlockNumber'
          | 'watchContractEvent'
        > &
          Pick<
            import('viem').WalletActions<
              {
                blockExplorers: {
                  readonly default: {
                    readonly name: 'Arbiscan';
                    readonly url: 'https://arbiscan.io';
                    readonly apiUrl: 'https://api.arbiscan.io/api';
                  };
                };
                contracts: {
                  readonly multicall3: {
                    readonly address: '0xca11bde05977b3631167028862be2a173976ca11';
                    readonly blockCreated: 7654707;
                  };
                };
                id: 42161;
                name: 'Arbitrum One';
                nativeCurrency: {
                  readonly name: 'Ether';
                  readonly symbol: 'ETH';
                  readonly decimals: 18;
                };
                rpcUrls: {
                  readonly default: {
                    readonly http: readonly ['https://arb1.arbitrum.io/rpc'];
                  };
                };
                sourceId?: number | undefined;
                testnet?: boolean | undefined;
                custom?: Record<string, unknown> | undefined;
                fees?: import('viem').ChainFees<undefined> | undefined;
                formatters?: undefined;
                serializers?:
                  | import('viem').ChainSerializers<
                      undefined,
                      import('viem').TransactionSerializable<bigint, number>
                    >
                  | undefined;
              },
              undefined
            >,
            'sendTransaction' | 'writeContract'
          >
      >,
    >(
      fn: (
        client: import('viem').Client<
          import('viem').HttpTransport,
          {
            blockExplorers: {
              readonly default: {
                readonly name: 'Arbiscan';
                readonly url: 'https://arbiscan.io';
                readonly apiUrl: 'https://api.arbiscan.io/api';
              };
            };
            contracts: {
              readonly multicall3: {
                readonly address: '0xca11bde05977b3631167028862be2a173976ca11';
                readonly blockCreated: 7654707;
              };
            };
            id: 42161;
            name: 'Arbitrum One';
            nativeCurrency: {
              readonly name: 'Ether';
              readonly symbol: 'ETH';
              readonly decimals: 18;
            };
            rpcUrls: {
              readonly default: {
                readonly http: readonly ['https://arb1.arbitrum.io/rpc'];
              };
            };
            sourceId?: number | undefined;
            testnet?: boolean | undefined;
            custom?: Record<string, unknown> | undefined;
            fees?: import('viem').ChainFees<undefined> | undefined;
            formatters?: undefined;
            serializers?:
              | import('viem').ChainSerializers<
                  undefined,
                  import('viem').TransactionSerializable<bigint, number>
                >
              | undefined;
          },
          undefined,
          import('viem').PublicRpcSchema,
          import('viem').PublicActions<
            import('viem').HttpTransport,
            {
              blockExplorers: {
                readonly default: {
                  readonly name: 'Arbiscan';
                  readonly url: 'https://arbiscan.io';
                  readonly apiUrl: 'https://api.arbiscan.io/api';
                };
              };
              contracts: {
                readonly multicall3: {
                  readonly address: '0xca11bde05977b3631167028862be2a173976ca11';
                  readonly blockCreated: 7654707;
                };
              };
              id: 42161;
              name: 'Arbitrum One';
              nativeCurrency: {
                readonly name: 'Ether';
                readonly symbol: 'ETH';
                readonly decimals: 18;
              };
              rpcUrls: {
                readonly default: {
                  readonly http: readonly ['https://arb1.arbitrum.io/rpc'];
                };
              };
              sourceId?: number | undefined;
              testnet?: boolean | undefined;
              custom?: Record<string, unknown> | undefined;
              fees?: import('viem').ChainFees<undefined> | undefined;
              formatters?: undefined;
              serializers?:
                | import('viem').ChainSerializers<
                    undefined,
                    import('viem').TransactionSerializable<bigint, number>
                  >
                | undefined;
            }
          >
        >,
      ) => client,
    ) => import('viem').Client<
      import('viem').HttpTransport,
      {
        blockExplorers: {
          readonly default: {
            readonly name: 'Arbiscan';
            readonly url: 'https://arbiscan.io';
            readonly apiUrl: 'https://api.arbiscan.io/api';
          };
        };
        contracts: {
          readonly multicall3: {
            readonly address: '0xca11bde05977b3631167028862be2a173976ca11';
            readonly blockCreated: 7654707;
          };
        };
        id: 42161;
        name: 'Arbitrum One';
        nativeCurrency: {
          readonly name: 'Ether';
          readonly symbol: 'ETH';
          readonly decimals: 18;
        };
        rpcUrls: {
          readonly default: {
            readonly http: readonly ['https://arb1.arbitrum.io/rpc'];
          };
        };
        sourceId?: number | undefined;
        testnet?: boolean | undefined;
        custom?: Record<string, unknown> | undefined;
        fees?: import('viem').ChainFees<undefined> | undefined;
        formatters?: undefined;
        serializers?:
          | import('viem').ChainSerializers<
              undefined,
              import('viem').TransactionSerializable<bigint, number>
            >
          | undefined;
      },
      undefined,
      import('viem').PublicRpcSchema,
      {[K in keyof client]: client[K]} & import('viem').PublicActions<
        import('viem').HttpTransport,
        {
          blockExplorers: {
            readonly default: {
              readonly name: 'Arbiscan';
              readonly url: 'https://arbiscan.io';
              readonly apiUrl: 'https://api.arbiscan.io/api';
            };
          };
          contracts: {
            readonly multicall3: {
              readonly address: '0xca11bde05977b3631167028862be2a173976ca11';
              readonly blockCreated: 7654707;
            };
          };
          id: 42161;
          name: 'Arbitrum One';
          nativeCurrency: {
            readonly name: 'Ether';
            readonly symbol: 'ETH';
            readonly decimals: 18;
          };
          rpcUrls: {
            readonly default: {
              readonly http: readonly ['https://arb1.arbitrum.io/rpc'];
            };
          };
          sourceId?: number | undefined;
          testnet?: boolean | undefined;
          custom?: Record<string, unknown> | undefined;
          fees?: import('viem').ChainFees<undefined> | undefined;
          formatters?: undefined;
          serializers?:
            | import('viem').ChainSerializers<
                undefined,
                import('viem').TransactionSerializable<bigint, number>
              >
            | undefined;
        }
      >
    >;
  };
  owner: any;
  entryPoint: {
    address: '0x0000000071727De22E5E9d8BAf0edAc6f37da032';
    version: string;
  };
}) {
  throw new Error('Function not implemented.');
}
