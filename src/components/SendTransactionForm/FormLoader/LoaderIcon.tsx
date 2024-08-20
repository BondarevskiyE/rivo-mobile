import React from 'react';

import {CheckIcon, CloseIcon} from '@/shared/ui/icons';
import {TRANSACTION_STATUS} from '../types';
import {Colors} from '@/shared/ui';
import {Loader} from '@/components/Loader';

interface LoaderIconProps {
  txStatus: TRANSACTION_STATUS;
}

export const LoaderIcon: React.FC<LoaderIconProps> = ({txStatus}) => {
  switch (txStatus) {
    case TRANSACTION_STATUS.SUCCESS:
      return <CheckIcon width={25} height={25} color={Colors.ui_green_46} />;
    case TRANSACTION_STATUS.FAIL:
      return <CloseIcon width={15} height={15} color={Colors.ui_red_83} />;
    default:
      return <Loader size={30} color={Colors.ui_grey_739} />;
  }
};
