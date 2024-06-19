import React from 'react';
import {PersistQueryClientProvider} from '@tanstack/react-query-persist-client';
import {createAsyncStoragePersister} from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {QueryClient} from '@tanstack/react-query';
import {serialize, deserialize} from 'wagmi';
import {withChildren} from '../types';

export const persister = createAsyncStoragePersister({
  serialize,
  storage: AsyncStorage,
  deserialize,
});

const queryClient = new QueryClient();

export const ReactQueryProvider = ({children}: withChildren) => {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{persister}}>
      {children}
    </PersistQueryClientProvider>
  );
};
