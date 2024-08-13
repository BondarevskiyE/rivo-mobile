import {parseUnits, formatUnits} from 'viem';

export const truncateDecimals = (val: string, decimals: number) => {
  const index = val.search(/\.|,/gi);

  if (index === -1) {
    return val;
  }

  if (decimals === 0) {
    return val.split('.')[0];
  }

  return val.slice(0, index + decimals + 1);
};

export const getTokenValueBigInt = (
  value: string,
  decimals: number,
): bigint => {
  const str = truncateDecimals(value, decimals);

  return parseUnits(str, decimals);
};

export const getTokenValueStr = (value: bigint, decimals: number): string => {
  return formatUnits(value, decimals);
};
