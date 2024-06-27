export const formatValue = (value: number | string) => {
  return (Math.round(+value * 100) / 100).toFixed(2);
};

export const shortenAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-5)}`;
};
