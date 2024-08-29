export const MILLION = 1000000;
export const BILLION = 1000000000;
export const TRILLION = 1000000000000;

export const formatValue = (value: number | string) => {
  return (Math.round(+value * 100) / 100).toFixed(3);
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
    return value?.toFixed(0).toString();
  }

  const suffix = SI_SYMBOL[tier];
  const scale = Math.pow(10, tier * 3);
  const scaled = value / scale;

  return `${formatNumber(scaled, fractionDigits)}${suffix}`;
};

export const countDecimals = (val: string, digits = 5): number => {
  if (isNaN(Number(val))) {
    throw new Error(`It is not a number ${val}`);
  }

  const [intPart, floatPart] = val.split('.');

  const floatAllZeros = floatPart?.split('').every(elem => elem === '0');

  if (!floatPart?.length || floatAllZeros) {
    return 0;
  }

  let decimals;

  if (intPart === '0') {
    decimals = floatPart.length > digits ? digits : floatPart.length;

    // e.g. 0.000000000321
    const isAllZeros = [...Array(decimals).keys()].every(
      elemIndex => floatPart[elemIndex] === '0',
    );

    if (isAllZeros) {
      const indexFirstNumber = [...floatPart].findIndex(
        number => number !== '0',
      );

      //get two meaningful numbers
      decimals = indexFirstNumber >= digits ? indexFirstNumber + 2 : 0;
    }
  } else {
    decimals = digits - intPart.length;
  }

  // cut extra zeros in the end
  if (decimals > 0) {
    const endZeros = floatPart.slice(0, decimals).match(/0+$/);
    let cuttedZeros = 0;

    if (endZeros && endZeros[0].length > 0) {
      cuttedZeros = endZeros[0].length;
    }

    return decimals - cuttedZeros;
  }

  return 0;
};

export const formatThousandSeparator = (
  val: string | number,
  thousandsSeparator = ',',
) => {
  const value = String(val);

  const [intPart, floatPart] = value.split('.');

  let formattedIntPart = intPart;

  formattedIntPart = intPart
    .split('')
    .reverse()
    .reduce((acc, cur, index, arr) => {
      const isThirdElem = (index + 1) % 3 === 0;
      const isLastElem = index === arr.length - 1;

      if (isThirdElem && !isLastElem) {
        return [...acc, cur, thousandsSeparator];
      }
      return [...acc, cur];
    }, [] as string[])
    .reverse()
    .join('');

  //there is no float part, return integer
  if (!floatPart?.length) {
    return formattedIntPart;
  }

  return `${formattedIntPart}${floatPart.length > 0 ? '.' + floatPart : ''}`;
};

export const formatNumber = (
  val: string | number,
  digits = 5,
  thousandsSeparator = ',',
) => {
  if (isNaN(Number(val))) {
    throw new Error(`It is not a number ${val}`);
  }

  const value = String(val);

  const [intPart, floatPart] = value.split('.');

  let formattedIntPart = intPart;

  // separate integer part with thousands separator
  if (thousandsSeparator !== '' && intPart !== '0') {
    formattedIntPart = intPart
      .split('')
      .reverse()
      .reduce((acc, cur, index, arr) => {
        const isThirdElem = (index + 1) % 3 === 0;
        const isLastElem = index === arr.length - 1;

        if (isThirdElem && !isLastElem) {
          return [...acc, cur, thousandsSeparator];
        }
        return [...acc, cur];
      }, [] as string[])
      .reverse()
      .join('');
  }

  //there is no float part, return integer
  if (!floatPart?.length) {
    return formattedIntPart;
  }

  // cut float part with digits and remove extra zeros
  const cuttedFloatPart = floatPart.slice(
    0,
    countDecimals(String(value), digits),
  );

  return `${formattedIntPart}${
    cuttedFloatPart.length > 0 ? '.' + cuttedFloatPart : ''
  }`;
};
