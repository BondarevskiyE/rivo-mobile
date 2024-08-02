export const MILLION = 1000000;
export const BILLION = 1000000000;
export const TRILLION = 1000000000000;

export const formatValue = (value: number | string) => {
  return (Math.round(+value * 100) / 100).toFixed(2);
};

export const shortenAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-5)}`;
};

export const getFormatValue = (val: number): string => {
  return Number(val?.toFixed(2)).toLocaleString(['en'], {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const abbreviateNumber = (value: number, fractionDigits = 1): string => {
  const SI_SYMBOL = ['', 'K', 'M', 'B', 'T', 'P', 'E'];

  // eslint-disable-next-line no-bitwise
  const tier = (Math.log10(Math.abs(value)) / 3) | 0;

  if (tier === 0) {
    return value.toFixed(0).toString();
  }

  const suffix = SI_SYMBOL[tier];
  const scale = Math.pow(10, tier * 3);
  const scaled = value / scale;

  return `${scaled.toFixed(fractionDigits)}${suffix}`;
};
