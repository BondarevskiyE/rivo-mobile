import React from 'react';
import {WagmiProvider} from './wagmi';
import {ReactQueryProvider} from './react-query';
import {withChildren} from '@/shared/types';

const Providers = ({children}: withChildren) => {
  return (
    <WagmiProvider>
      <ReactQueryProvider>{children}</ReactQueryProvider>
    </WagmiProvider>
  );
};

export default Providers;
