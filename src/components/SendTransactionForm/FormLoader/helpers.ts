import {Colors} from '@/shared/ui';
import {TRANSACTION_STATUS} from '../types';

export const getLoaderTextColor = (txStatus: TRANSACTION_STATUS) => {
  switch (txStatus) {
    case TRANSACTION_STATUS.SUCCESS:
      return Colors.ui_green_46;
    case TRANSACTION_STATUS.FAIL:
      return Colors.ui_red_83;
    default:
      return Colors.grey_text;
  }
};

export const getLoaderBackgroundColor = (txStatus: TRANSACTION_STATUS) => {
  switch (txStatus) {
    case TRANSACTION_STATUS.SUCCESS:
      return Colors.ui_green_90;
    case TRANSACTION_STATUS.FAIL:
      return Colors.ui_red_40;
    default:
      return Colors.ui_black_75;
  }
};
