import {formatNumber} from '@/shared/lib/format';
import {IndexEarned} from '@/store/types';

export const getIndexEarnedText = (earned: IndexEarned) => {
  const percent = +formatNumber(earned?.Percent || 0, 5, '');
  const usd = +formatNumber(earned?.Usd || 0, 5, '');

  const indexEarnedText = `${percent < 0 ? '-' : '+'}${percent}% • ${
    usd < 0 ? `-$${usd || 0}` : `$${usd || 0}`
  }`;

  return indexEarnedText;
};
