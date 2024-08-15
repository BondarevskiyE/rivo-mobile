export const getInputFontSize = (inputLength: number) => {
  if (inputLength > 10) {
    return 32;
  }

  if (inputLength > 5) {
    return 48;
  }

  return 64;
};

export const getActionButtonText = (
  inputValue: string,
  balance: number,
  isLoading: boolean,
) => {
  if (isLoading) {
    return 'Processing';
  }
  if (!inputValue) {
    return 'Enter Amount';
  }

  if (+inputValue > balance) {
    return 'Insufificient balance';
  }

  return 'Invest';
};
